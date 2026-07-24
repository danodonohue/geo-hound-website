import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectCandidates, seedRow } from './harvest-core.mjs';

test('selectCandidates ranks by rankScore, dedupes by normalized_url, caps at 1.5x target', () => {
  const rows = [
    { normalized_url: 'https://a', discovery_count: 1 },
    { normalized_url: 'https://a', discovery_count: 9, service_title: 'T' },
    { normalized_url: 'https://b', discovery_count: 5, service_title: 'T', service_abstract: 'A' },
    { normalized_url: 'https://c', discovery_count: 0 },
  ];
  const picked = selectCandidates(rows, 2);
  assert.equal(picked.length, 3);
  assert.equal(picked[0].normalized_url, 'https://b');
  assert.equal(picked.filter((r) => r.normalized_url === 'https://a').length, 1);
  assert.equal(picked.find((r) => r.normalized_url === 'https://a').discovery_count, 9);
});

test('seedRow synthesizes a directory-shaped row from a bare url', () => {
  const row = seedRow('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer');
  assert.equal(row.service_type, 'ESRI MapServer');
  assert.equal(row.discovery_count, 1);
  assert.deepEqual(row.original_urls, ['https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer']);
});
