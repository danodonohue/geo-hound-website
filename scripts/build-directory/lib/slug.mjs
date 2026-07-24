const TYPE_SHORT = new Map([
  ['ESRI MapServer', 'mapserver'], ['ESRI FeatureServer', 'featureserver'],
  ['ESRI ImageServer', 'imageserver'], ['ESRI VectorTileServer', 'vectortiles'],
  ['OGC WMS', 'wms'], ['OGC WFS', 'wfs'], ['OGC WMTS', 'wmts'], ['OGC WCS', 'wcs'],
  ['OGC API - Features', 'ogc-features'], ['OGC API - Tiles', 'ogc-tiles'],
  ['XYZ Tiles', 'tiles'], ['Vector Tiles', 'vector-tiles'],
]);

export function slugify(text) {
  return String(text ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function typeShort(type) {
  return TYPE_SHORT.get(type) ?? 'service';
}

export function serviceSlug({ title, provider, url, type }) {
  let owner = provider;
  if (!owner) {
    try { owner = new URL(url).hostname; } catch { owner = ''; }
  }
  return [slugify(owner), slugify(title), typeShort(type)].filter(Boolean).join('-');
}

export function placeSlug({ country, state }) {
  return state ? `${slugify(state)}-${slugify(country)}` : slugify(country);
}

export const themeSlug = slugify;
