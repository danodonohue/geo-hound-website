import { XMLParser } from 'fast-xml-parser';

const TIMEOUT_MS = 10_000;
const MAX_LAYERS = 60;
const MAX_LAYER_DETAIL = 15;

async function get(fetchImpl, url) {
  const started = Date.now();
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  return { res, ms: Date.now() - started };
}

function esriGeometry(g) {
  return ({ esriGeometryPoint: 'point', esriGeometryMultipoint: 'point',
    esriGeometryPolyline: 'line', esriGeometryPolygon: 'polygon' })[g] ?? (g ? 'other' : null);
}

async function probeEsri(fetchImpl, url, wantCounts) {
  const { res, ms } = await get(fetchImpl, `${url}?f=json`);
  const root = await res.json();
  if (root.error) return emptyResult(false);
  const listed = (root.layers ?? []).slice(0, MAX_LAYERS);
  const layers = [];
  for (const [i, l] of listed.entries()) {
    const layer = { id: l.id, name: l.name, title: l.name,
      geometry: esriGeometry(l.geometryType), fields: [], feature_count: null };
    if (i < MAX_LAYER_DETAIL) {
      try {
        const detail = await (await fetchImpl(`${url}/${l.id}?f=json`,
          { signal: AbortSignal.timeout(TIMEOUT_MS) })).json();
        layer.geometry = esriGeometry(detail.geometryType) ?? layer.geometry;
        layer.fields = (detail.fields ?? []).map((f) => ({ name: f.name, type: f.type, alias: f.alias ?? f.name }));
        if (wantCounts) {
          const c = await (await fetchImpl(`${url}/${l.id}/query?where=1%3D1&returnCountOnly=true&f=json`,
            { signal: AbortSignal.timeout(TIMEOUT_MS) })).json();
          if (Number.isFinite(c.count)) layer.feature_count = c.count;
        }
      } catch { /* per-layer detail is best-effort */ }
    }
    layers.push(layer);
  }
  const ext = root.fullExtent ?? root.extent;
  const wkid = ext?.spatialReference?.wkid ?? ext?.spatialReference?.latestWkid;
  const bbox = ext && wkid === 4326 ? [ext.xmin, ext.ymin, ext.xmax, ext.ymax] : null;
  return {
    alive: true, response_ms: ms,
    title: root.mapName || root.name || root.documentInfo?.Title || null,
    abstract: root.description || root.serviceDescription || null,
    layers,
    formats: root.supportedImageFormatTypes ? root.supportedImageFormatTypes.split(',') : [],
    crs: root.spatialReference?.wkid ? [`EPSG:${root.spatialReference.wkid}`] : [],
    bbox,
  };
}

function wmsCapsUrl(url) {
  const base = url.split('?')[0];
  return `${base}?SERVICE=WMS&REQUEST=GetCapabilities`;
}

function flattenWmsLayers(node, out) {
  if (!node) return out;
  for (const l of [node].flat()) {
    if (l.Name != null && out.length < MAX_LAYERS) {
      const g = l.EX_GeographicBoundingBox;
      out.push({ id: String(l.Name), name: String(l.Name), title: String(l.Title ?? l.Name),
        geometry: null, fields: [], feature_count: null,
        _bbox: g ? [Number(g.westBoundLongitude), Number(g.southBoundLatitude),
          Number(g.eastBoundLongitude), Number(g.northBoundLatitude)] : null });
    }
    if (l.Layer) flattenWmsLayers(l.Layer, out);
  }
  return out;
}

async function probeWms(fetchImpl, url) {
  const { res, ms } = await get(fetchImpl, wmsCapsUrl(url));
  const parsed = new XMLParser({ ignoreAttributes: true }).parse(await res.text());
  const caps = parsed.WMS_Capabilities ?? parsed.WMT_MS_Capabilities;
  if (!caps) return emptyResult(false);
  const rootLayer = caps.Capability?.Layer;
  const layers = flattenWmsLayers(rootLayer, []);
  const bbox = layers.find((l) => l._bbox)?._bbox ?? null;
  for (const l of layers) delete l._bbox;
  const fmt = caps.Capability?.Request?.GetMap?.Format ?? [];
  const crs = [rootLayer?.CRS ?? rootLayer?.SRS ?? []].flat().map(String);
  return {
    alive: true, response_ms: ms,
    title: caps.Service?.Title ? String(caps.Service.Title) : null,
    abstract: caps.Service?.Abstract ? String(caps.Service.Abstract) : null,
    layers, formats: [fmt].flat().map(String), crs, bbox,
  };
}

function emptyResult(alive, ms = null) {
  return { alive, response_ms: ms, title: null, abstract: null,
    layers: [], formats: [], crs: [], bbox: null };
}

export async function probeService({ url, type }, fetchImpl = fetch) {
  try {
    if (type?.startsWith('ESRI')) return await probeEsri(fetchImpl, url, type === 'ESRI FeatureServer');
    if (type === 'OGC WMS') return await probeWms(fetchImpl, url);
    // Tiles, vector tiles, WFS, OGC API: liveness only in v1.
    const { res, ms } = await get(fetchImpl, url);
    return emptyResult(res.ok, ms);
  } catch {
    return emptyResult(false);
  }
}
