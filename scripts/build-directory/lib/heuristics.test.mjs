import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  THEMES, detectType, parseBbox, bboxIsSane, placeFromDomain, rankScore, qualityScore,
} from './heuristics.mjs';

test('detectType recognises common service urls', () => {
  assert.equal(detectType('https://x.gov/arcgis/rest/services/A/MapServer'), 'ESRI MapServer');
  assert.equal(detectType('https://x.gov/arcgis/rest/services/A/FeatureServer/0'), 'ESRI FeatureServer');
  assert.equal(detectType('https://x.gov/arcgis/rest/services/A/ImageServer'), 'ESRI ImageServer');
  assert.equal(detectType('https://x.de/service?SERVICE=WMS&REQUEST=GetCapabilities'), 'OGC WMS');
  assert.equal(detectType('https://x.de/geoserver/wfs?service=WFS'), 'OGC WFS');
  assert.equal(detectType('https://tiles.x.com/{z}/{x}/{y}.png'), 'XYZ Tiles');
  assert.equal(detectType('https://example.com/page.html'), null);
});

test('parseBbox handles csv string, json array, and garbage', () => {
  assert.deepEqual(parseBbox('165.8,-47.5,179.2,-33.9'), [165.8, -47.5, 179.2, -33.9]);
  assert.deepEqual(parseBbox('[165.8, -47.5, 179.2, -33.9]'), [165.8, -47.5, 179.2, -33.9]);
  assert.deepEqual(parseBbox([1, 2, 3, 4]), [1, 2, 3, 4]);
  assert.equal(parseBbox('not a box'), null);
  assert.equal(parseBbox(null), null);
});

test('bboxIsSane rejects world-spanning, inverted, out-of-range boxes', () => {
  assert.equal(bboxIsSane([165.8, -47.5, 179.2, -33.9]), true);
  assert.equal(bboxIsSane([-180, -90, 180, 90]), false);
  assert.equal(bboxIsSane([-179.9, -89, 179.9, 89]), false);
  assert.equal(bboxIsSane([10, 5, 4, 8]), false);
  assert.equal(bboxIsSane([200, 0, 210, 10]), false);
  assert.equal(bboxIsSane(null), false);
});

test('placeFromDomain infers country from ccTLD-style government domains', () => {
  assert.deepEqual(placeFromDomain('https://gis.ecan.govt.nz/arcgis'),
    { country: 'New Zealand', state: null, confidence: 'high' });
  assert.deepEqual(placeFromDomain('https://data.gov.au/x'),
    { country: 'Australia', state: null, confidence: 'high' });
  assert.deepEqual(placeFromDomain('https://environment.data.gov.uk/x'),
    { country: 'United Kingdom', state: null, confidence: 'high' });
  assert.equal(placeFromDomain('https://services.arcgis.com/x'), null);
});

test('rankScore rewards discovery count, metadata richness, recency', () => {
  const rich = rankScore({
    discovery_count: 9, service_title: 'T', service_abstract: 'A',
    layer_names: ['a', 'b'], cors_enabled: true, last_verified: '2026-07-01',
  });
  const poor = rankScore({ discovery_count: 1 });
  assert.ok(rich > poor);
});

test('qualityScore in [0,1], rewards completeness', () => {
  const full = qualityScore({
    title: 'T', description: 'D', layers: [{ fields: [{ name: 'f' }] }],
    place: { confidence: 'high' }, themes: [{ name: 'parcels' }],
  });
  assert.ok(full > 0.8 && full <= 1);
  assert.ok(qualityScore({}) < 0.3);
});

test('THEMES is a non-empty kebab-case vocabulary', () => {
  assert.ok(THEMES.length >= 15);
  for (const t of THEMES) assert.match(t, /^[a-z0-9-]+$/);
});
