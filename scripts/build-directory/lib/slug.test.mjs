import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, serviceSlug, placeSlug, typeShort } from './slug.mjs';

test('slugify lowercases, strips punctuation, collapses dashes', () => {
  assert.equal(slugify('Flood Hazard  (2024) - v2!'), 'flood-hazard-2024-v2');
  assert.equal(slugify('Māori land blocks'), 'maori-land-blocks');
});

test('typeShort maps extension vocabulary', () => {
  assert.equal(typeShort('ESRI MapServer'), 'mapserver');
  assert.equal(typeShort('ESRI FeatureServer'), 'featureserver');
  assert.equal(typeShort('OGC WMS'), 'wms');
  assert.equal(typeShort('XYZ Tiles'), 'tiles');
  assert.equal(typeShort('Something New'), 'service');
});

test('serviceSlug combines provider, title, short type', () => {
  const s = serviceSlug({
    title: 'Flood hazard', provider: 'Environment Canterbury',
    url: 'https://gis.ecan.govt.nz/arcgis/rest/services/Flood/MapServer',
    type: 'ESRI MapServer',
  });
  assert.equal(s, 'environment-canterbury-flood-hazard-mapserver');
});

test('serviceSlug falls back to url host when provider missing', () => {
  const s = serviceSlug({
    title: 'Flood hazard', provider: null,
    url: 'https://gis.ecan.govt.nz/arcgis/rest/services/Flood/MapServer',
    type: 'ESRI MapServer',
  });
  assert.equal(s, 'gis-ecan-govt-nz-flood-hazard-mapserver');
});

test('serviceSlug is capped and never ends in a dash', () => {
  const s = serviceSlug({
    title: 'word '.repeat(120), provider: 'Some Very Long Provider Name Incorporated',
    url: 'https://example.gov/arcgis/rest/services/X/MapServer', type: 'ESRI MapServer',
  });
  assert.ok(s.length <= 80, `slug too long: ${s.length}`);
  assert.ok(!s.endsWith('-'));
});

test('placeSlug: country alone, and state qualified by country', () => {
  assert.equal(placeSlug({ country: 'New Zealand', state: null }), 'new-zealand');
  assert.equal(placeSlug({ country: 'New Zealand', state: 'Canterbury' }), 'canterbury-new-zealand');
});
