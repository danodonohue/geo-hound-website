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

/* Windows paths cap out around 260 characters and some source titles are
   entire HTML abstracts, so slugs are hard-capped. */
const MAX_SLUG = 80;

export function serviceSlug({ title, provider, url, type }) {
  let owner = provider;
  if (!owner) {
    try { owner = new URL(url).hostname; } catch { owner = ''; }
  }
  const suffix = typeShort(type);
  const budget = MAX_SLUG - suffix.length - 1;
  const stem = [slugify(owner), slugify(title)].filter(Boolean).join('-')
    .slice(0, budget).replace(/-+$/, '');
  return [stem, suffix].filter(Boolean).join('-');
}

export function placeSlug({ country, state }) {
  return state ? `${slugify(state)}-${slugify(country)}` : slugify(country);
}

export const themeSlug = slugify;
