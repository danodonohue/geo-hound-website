import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baseMeaning, needsLlm, buildPrompt, mergeLlm } from './enrich-core.mjs';

const entry = {
  raw: { normalized_url: 'https://gis.ecan.govt.nz/arcgis/rest/services/Flood/MapServer',
    service_type: 'ESRI MapServer', service_title: 'Flood hazard',
    provider_name: 'Environment Canterbury', bounding_box: '166,-47,179,-34' },
  probe: { title: 'Flood hazard', abstract: null,
    layers: [{ name: 'Flood extents', fields: [{ name: 'DEPTH_M' }] }], bbox: null },
};

test('baseMeaning takes domain place and copies probe/raw metadata', () => {
  const m = baseMeaning(entry);
  assert.equal(m.title, 'Flood hazard');
  assert.equal(m.provider, 'Environment Canterbury');
  assert.deepEqual(m.place, { country: 'New Zealand', state: null, confidence: 'high' });
  assert.deepEqual(m.themes, []);
  assert.equal(m.description, null);
});

test('needsLlm is true when description or themes are missing', () => {
  assert.equal(needsLlm(baseMeaning(entry)), true);
  assert.equal(needsLlm({ description: 'd', themes: [{ name: 'flood' }],
    place: { country: 'X', confidence: 'high' } }), false);
});

test('buildPrompt includes the strongest signals', () => {
  const p = buildPrompt(entry);
  for (const needle of ['Flood hazard', 'gis.ecan.govt.nz', 'Flood extents', 'DEPTH_M', '166,-47,179,-34']) {
    assert.ok(p.includes(needle), `prompt missing ${needle}`);
  }
});

test('mergeLlm: heuristic place wins, LLM state accepted on agreement, themes filtered', () => {
  const m = baseMeaning(entry);
  const merged = mergeLlm(m, {
    description: 'Flood hazard extents for Canterbury.',
    place: { country: 'New Zealand', state: 'Canterbury', confidence: 'high' },
    themes: [{ name: 'flood', confidence: 'high' }, { name: 'not-a-theme', confidence: 'high' }],
  });
  assert.equal(merged.description, 'Flood hazard extents for Canterbury.');
  assert.deepEqual(merged.place, { country: 'New Zealand', state: 'Canterbury', confidence: 'high' });
  assert.deepEqual(merged.themes, [{ name: 'flood', confidence: 'high' }]);
});

test('mergeLlm: LLM-only country is capped at medium; unknown clears place', () => {
  const noDomain = { ...entry, raw: { ...entry.raw, normalized_url: 'https://services.arcgis.com/x/MapServer' } };
  const m = baseMeaning(noDomain);
  assert.equal(m.place, null);
  const merged = mergeLlm(m, { description: 'd',
    place: { country: 'France', state: null, confidence: 'high' }, themes: [] });
  assert.deepEqual(merged.place, { country: 'France', state: null, confidence: 'medium' });
  const unknown = mergeLlm(m, { description: 'd', place: { country: 'unknown' }, themes: [] });
  assert.equal(unknown.place, null);
});
