import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRecord, assignSlug, buildIndex, validateRecord } from './emit-core.mjs';

const entry = {
  raw: { normalized_url: 'https://gis.ecan.govt.nz/arcgis/rest/services/Flood/MapServer',
    service_type: 'ESRI MapServer', discovery_count: 4, cors_enabled: true },
  probe: { alive: true, response_ms: 300, title: 'Flood hazard', abstract: 'Extents.',
    layers: [{ id: 0, name: 'Extents', title: 'Extents', geometry: 'polygon',
      fields: [{ name: 'DEPTH_M', type: 'esriFieldTypeDouble', alias: 'Depth' }], feature_count: 120 }],
    formats: ['PNG32'], crs: ['EPSG:4326'], bbox: [166, -47, 179, -34] },
  meaning: { title: 'Flood hazard', description: 'Flood extents for Canterbury.',
    abstract: 'Extents.', provider: 'Environment Canterbury',
    place: { country: 'New Zealand', state: 'Canterbury', confidence: 'high' },
    themes: [{ name: 'flood', confidence: 'high' }] },
};

test('buildRecord assembles a valid record from an enriched entry', () => {
  const r = buildRecord(entry, '2026-07-24');
  assert.equal(validateRecord(r).length, 0, validateRecord(r).join('; '));
  assert.equal(r.service_key, 'ESRI MapServer:https://gis.ecan.govt.nz/arcgis/rest/services/Flood/MapServer');
  assert.equal(r.last_verified, '2026-07-24');
  assert.ok(r.quality_score >= 0.5);
});

test('buildRecord returns null below the quality gate', () => {
  const thin = { raw: entry.raw, probe: { ...entry.probe, title: null, layers: [] },
    meaning: { title: null, description: null, abstract: null, provider: null, place: null, themes: [] } };
  assert.equal(buildRecord(thin, '2026-07-24'), null);
});

test('assignSlug reuses the slug of an existing record with the same service_key', () => {
  const record = buildRecord(entry, '2026-07-24');
  const existing = new Map([[record.service_key, 'old-stable-slug']]);
  assert.equal(assignSlug(record, existing, []), 'old-stable-slug');
});

test('assignSlug disambiguates collisions and honours removed.json', () => {
  const record = buildRecord(entry, '2026-07-24');
  const bySlug = new Map([[record.slug, 'other-key']]);
  assert.equal(assignSlug(record, new Map(), [], bySlug), `${record.slug}-2`);
  assert.equal(assignSlug(record, new Map(), [record.service_key]), null);
  assert.equal(assignSlug(record, new Map(), [record.slug]), null);
});

test('buildIndex is compact: slug, title, type, provider, place, themes, description', () => {
  const record = buildRecord(entry, '2026-07-24');
  const [ix] = buildIndex([record]);
  assert.deepEqual(Object.keys(ix).sort(),
    ['description', 'place', 'provider', 'slug', 'themes', 'title', 'type'].sort());
  assert.deepEqual(ix.themes, ['flood']);
});

test('validateRecord reports missing required fields', () => {
  const errors = validateRecord({ slug: 'x' });
  assert.ok(errors.some((e) => e.includes('service_key')));
  assert.ok(errors.some((e) => e.includes('title')));
});
