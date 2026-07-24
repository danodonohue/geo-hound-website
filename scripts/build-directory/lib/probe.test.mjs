import { test } from 'node:test';
import assert from 'node:assert/strict';
import { probeService } from './probe.mjs';

function stubFetch(routes) {
  // routes: [ [substring, body, contentType?] ] matched in order
  return async (url) => {
    const hit = routes.find(([sub]) => String(url).includes(sub));
    if (!hit) throw new Error(`unexpected fetch: ${url}`);
    const [, body, ct = 'application/json'] = hit;
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status: 200, headers: { 'content-type': ct },
    });
  };
}

test('ESRI MapServer probe: root f=json then per-layer fields', async () => {
  const fetchImpl = stubFetch([
    ['/MapServer/0?f=json', {
      name: 'Parcels', geometryType: 'esriGeometryPolygon',
      fields: [{ name: 'OWNER', type: 'esriFieldTypeString', alias: 'Owner' }],
    }],
    ['/MapServer?f=json', {
      mapName: 'Cadastre', description: 'District cadastre',
      layers: [{ id: 0, name: 'Parcels' }],
      fullExtent: { xmin: 170, ymin: -44, xmax: 173, ymax: -42,
        spatialReference: { wkid: 4326 } },
      supportedImageFormatTypes: 'PNG32,JPG',
    }],
  ]);
  const r = await probeService(
    { url: 'https://x.govt.nz/arcgis/rest/services/C/MapServer', type: 'ESRI MapServer' },
    fetchImpl,
  );
  assert.equal(r.alive, true);
  assert.equal(r.title, 'Cadastre');
  assert.equal(r.layers.length, 1);
  assert.equal(r.layers[0].geometry, 'polygon');
  assert.deepEqual(r.layers[0].fields[0], { name: 'OWNER', type: 'esriFieldTypeString', alias: 'Owner' });
  assert.deepEqual(r.bbox, [170, -44, 173, -42]);
});

test('WMS probe parses GetCapabilities layers and formats', async () => {
  const xml = `<?xml version="1.0"?>
  <WMS_Capabilities><Service><Title>Radar</Title><Abstract>Rain radar</Abstract></Service>
  <Capability><Request><GetMap><Format>image/png</Format><Format>image/jpeg</Format></GetMap></Request>
  <Layer><CRS>EPSG:4326</CRS>
    <Layer><Name>nexrad</Name><Title>Base reflectivity</Title>
      <EX_GeographicBoundingBox><westBoundLongitude>-126</westBoundLongitude>
      <eastBoundLongitude>-66</eastBoundLongitude><southBoundLatitude>24</southBoundLatitude>
      <northBoundLatitude>50</northBoundLatitude></EX_GeographicBoundingBox></Layer>
  </Layer></Capability></WMS_Capabilities>`;
  const fetchImpl = stubFetch([['GetCapabilities', xml, 'text/xml']]);
  const r = await probeService({ url: 'https://x.edu/wms', type: 'OGC WMS' }, fetchImpl);
  assert.equal(r.alive, true);
  assert.equal(r.title, 'Radar');
  assert.equal(r.layers[0].name, 'nexrad');
  assert.deepEqual(r.formats, ['image/png', 'image/jpeg']);
  assert.deepEqual(r.bbox, [-126, 24, -66, 50]);
});

test('dead service reports alive: false and never throws', async () => {
  const fetchImpl = async () => { throw new Error('ECONNREFUSED'); };
  const r = await probeService(
    { url: 'https://gone.example/arcgis/rest/services/X/MapServer', type: 'ESRI MapServer' },
    fetchImpl,
  );
  assert.equal(r.alive, false);
});

test('esri wkid other than 4326 drops bbox rather than lying', async () => {
  const fetchImpl = stubFetch([
    ['/MapServer?f=json', {
      mapName: 'M', layers: [],
      fullExtent: { xmin: 19457000, ymin: -5000000, xmax: 19458000, ymax: -4999000,
        spatialReference: { wkid: 3857 } },
    }],
  ]);
  const r = await probeService({ url: 'https://x/arcgis/rest/services/M/MapServer', type: 'ESRI MapServer' }, fetchImpl);
  assert.equal(r.bbox, null);
});
