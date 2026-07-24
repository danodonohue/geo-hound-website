import { serviceSlug } from './slug.mjs';
import { parseBbox, bboxIsSane, qualityScore } from './heuristics.mjs';

const NO_LAYER_TYPES = new Set(['OGC WMS', 'OGC WMTS', 'ESRI ImageServer',
  'XYZ Tiles', 'Vector Tiles', 'ESRI VectorTileServer']);

export function buildRecord({ raw, probe, meaning }, today) {
  if (!probe.alive) return null;
  const title = meaning.title;
  const description = meaning.description
    ?? (meaning.abstract ? meaning.abstract.split(/(?<=\.)\s/)[0] : null);
  if (!title || !description) return null;
  // A title that long is junk metadata (some services put whole HTML
  // abstracts in the title field); not worth a page.
  if (title.length > 160 || /<[a-z]+[^>]*>/i.test(title)) return null;
  if (probe.layers.length === 0 && !NO_LAYER_TYPES.has(raw.service_type)) return null;

  // Some sources stuff whole abstracts into the provider field; a provider
  // that long is junk and would poison the slug.
  const provider = meaning.provider && meaning.provider.length <= 80 ? meaning.provider : null;

  const bboxCandidate = probe.bbox ?? parseBbox(raw.bounding_box);
  const record = {
    slug: serviceSlug({ title, provider, url: raw.normalized_url, type: raw.service_type }),
    service_key: `${raw.service_type}:${raw.normalized_url}`,
    type: raw.service_type,
    url: raw.normalized_url,
    title,
    description,
    ...(meaning.abstract ? { abstract: meaning.abstract } : {}),
    ...(provider ? { provider } : {}),
    place: meaning.place ?? null,
    themes: meaning.themes,
    bbox: bboxIsSane(bboxCandidate) ? bboxCandidate : null,
    layers: probe.layers,
    formats: probe.formats, crs: probe.crs,
    cors_enabled: raw.cors_enabled ?? null,
    response_ms: probe.response_ms ?? null,
    last_verified: today,
    discovery_count: raw.discovery_count ?? 1,
    quality_score: 0,
    enrichment: { model: meaning.enrichedBy ?? null, date: today, notes: '' },
  };
  record.quality_score = qualityScore(record);
  return record.quality_score >= 0.5 ? record : null;
}

export function assignSlug(record, existingByKey, removed, takenBySlug = new Map()) {
  if (removed.includes(record.service_key) || removed.includes(record.slug)) return null;
  const existing = existingByKey.get(record.service_key);
  if (existing) return existing;
  let slug = record.slug;
  let n = 1;
  while (takenBySlug.has(slug) && takenBySlug.get(slug) !== record.service_key) {
    n += 1; slug = `${record.slug}-${n}`;
  }
  return slug;
}

export function buildIndex(records) {
  return records.map((r) => ({
    slug: r.slug, title: r.title, type: r.type,
    provider: r.provider ?? null,
    place: r.place ? { country: r.place.country, state: r.place.state ?? null } : null,
    themes: r.themes.map((t) => t.name),
    description: r.description,
  }));
}

const REQUIRED = ['slug', 'service_key', 'type', 'url', 'title', 'description',
  'themes', 'layers', 'formats', 'crs', 'last_verified', 'discovery_count', 'quality_score', 'enrichment'];

export function validateRecord(record) {
  const errors = [];
  for (const key of REQUIRED) {
    if (record[key] === undefined) errors.push(`missing ${key}`);
  }
  if (record.slug && !/^[a-z0-9-]+$/.test(record.slug)) errors.push('slug not kebab-case');
  if (record.bbox !== undefined && record.bbox !== null && !bboxIsSane(record.bbox)) errors.push('bbox not sane');
  if (record.place && !['high', 'medium', 'low'].includes(record.place.confidence)) errors.push('place confidence invalid');
  for (const t of record.themes ?? []) {
    if (!t.name || !['high', 'medium', 'low'].includes(t.confidence)) errors.push('theme invalid');
  }
  return errors;
}
