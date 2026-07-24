export const THEMES = [
  'parcels', 'addresses', 'boundaries', 'planning', 'zoning',
  'transport', 'roads', 'rail', 'utilities', 'infrastructure',
  'hydrology', 'flood', 'coastal', 'marine', 'elevation', 'imagery',
  'geology', 'soils', 'land-cover', 'environment', 'conservation',
  'agriculture', 'forestry', 'weather', 'climate', 'demographics',
  'health', 'safety', 'recreation', 'heritage',
];

const DOMAIN_COUNTRIES = [
  [/\.govt\.nz$|\.co\.nz$|\.org\.nz$|\.cri\.nz$|\.ac\.nz$/, 'New Zealand'],
  [/\.gov\.au$|\.com\.au$|\.org\.au$/, 'Australia'],
  [/\.gov\.uk$|\.ac\.uk$/, 'United Kingdom'],
  [/\.gc\.ca$|\.canada\.ca$/, 'Canada'],
  [/\.gov$|\.mil$/, 'United States'],
  [/\.bund\.de$/, 'Germany'],
  [/\.gouv\.fr$/, 'France'],
];

export function detectType(url) {
  const u = String(url ?? '');
  const lower = u.toLowerCase();
  if (/\/mapserver(\/|\?|$)/i.test(u)) return 'ESRI MapServer';
  if (/\/featureserver(\/\d+)?(\/|\?|$)/i.test(u)) return 'ESRI FeatureServer';
  if (/\/imageserver(\/|\?|$)/i.test(u)) return 'ESRI ImageServer';
  if (/\/vectortileserver(\/|\?|$)/i.test(u)) return 'ESRI VectorTileServer';
  if (lower.includes('service=wms') || /\/wms(\/|\?|$)/i.test(u)) return 'OGC WMS';
  if (lower.includes('service=wfs') || /\/wfs(\/|\?|$)/i.test(u)) return 'OGC WFS';
  if (lower.includes('service=wmts') || /\/wmts(\/|\?|$)/i.test(u)) return 'OGC WMTS';
  if (/\{z\}\/\{x\}\/\{y\}|\{z\}\/\{y\}\/\{x\}/.test(u)) return 'XYZ Tiles';
  return null;
}

export function parseBbox(value) {
  if (value == null) return null;
  let parts = null;
  if (Array.isArray(value)) parts = value;
  else if (typeof value === 'string') {
    const s = value.trim();
    if (s.startsWith('[')) {
      try { parts = JSON.parse(s); } catch { return null; }
    } else parts = s.split(',');
  }
  if (!Array.isArray(parts) || parts.length !== 4) return null;
  const nums = parts.map(Number);
  return nums.every(Number.isFinite) ? nums : null;
}

export function bboxIsSane(bbox) {
  if (!Array.isArray(bbox) || bbox.length !== 4) return false;
  const [minx, miny, maxx, maxy] = bbox;
  if (minx < -180 || maxx > 180 || miny < -90 || maxy > 90) return false;
  if (minx >= maxx || miny >= maxy) return false;
  // A box covering nearly the whole planet says nothing about place.
  if (maxx - minx > 350 && maxy - miny > 160) return false;
  return true;
}

export function placeFromDomain(url) {
  let host;
  try { host = new URL(url).hostname; } catch { return null; }
  for (const [re, country] of DOMAIN_COUNTRIES) {
    if (re.test(host)) return { country, state: null, confidence: 'high' };
  }
  return null;
}

export function rankScore(row) {
  let score = Math.log((row.discovery_count ?? 0) + 1);
  if (row.service_title) score += 2;
  if (row.service_abstract) score += 1;
  if ((row.layer_names ?? []).length > 0) score += 1;
  if (row.cors_enabled) score += 0.5;
  if (row.last_verified && Date.parse(row.last_verified) > Date.now() - 90 * 86400e3) score += 1;
  return score;
}

export function qualityScore(record) {
  let score = 0;
  if (record.title) score += 0.2;
  if (record.description) score += 0.2;
  if ((record.layers ?? []).length > 0) score += 0.2;
  if ((record.layers ?? []).some((l) => (l.fields ?? []).length > 0)) score += 0.2;
  const placeConf = record.place?.confidence;
  if (placeConf === 'high' || placeConf === 'medium') score += 0.1;
  if ((record.themes ?? []).length > 0) score += 0.1;
  return Math.round(score * 100) / 100;
}
