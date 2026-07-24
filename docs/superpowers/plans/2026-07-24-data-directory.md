# Data Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the curated GIS-service directory: an offline batch pipeline that turns Supabase `global_service_directory` records into reviewed JSON files in `content/directory/`, and static `/data` pages (service datasheets, place/theme hubs, client-side search, click-to-load Leaflet previews).

**Architecture:** Three-stage Node pipeline (`harvest -> enrich -> emit`) run manually on the owner's machine, output committed to git. The Next.js site statically generates all `/data` routes from the committed files via `generateStaticParams`. No runtime Supabase, no new API routes. Spec: `docs/superpowers/specs/2026-07-24-data-directory-design.md`.

**Tech Stack:** Node 20+ ESM scripts (`.mjs`, global `fetch`, `node --test`), `fast-xml-parser` (dev, WMS capabilities), Anthropic API (Haiku, optional stage), Next.js 16 App Router (static), Leaflet 1.9 + `@types/leaflet` (client-only, dynamic import), CSS modules + existing `gh-*` utility classes.

## Global Constraints

- **No emoji or dingbat characters anywhere** — copy, source, comments, commit messages (AGENTS.md hard rule 1). Icons come from `components/icons/`.
- **Never edit `styles/tokens.css`** (hard rule 2). Consume variables only.
- **Identity/numbers from `lib/constants.ts`** (hard rule 3): use `CONTACT_EMAIL`, `SITE_URL`, `INSTALL_CTA_LABEL`. No prices appear in this feature.
- **Borders, not shadows** (hard rule 4): 1.5px hairlines / 2px ink borders, near-square corners, flat surfaces. Reuse `gh-card`, `gh-btn`, `gh-label`, `gh-wrap` classes from `app/globals.css`.
- **Uppercase only via `.gh-label`** and buttons; headings are sentence case (hard rule 5).
- **Copy plain and specific** (hard rule 6): name QGIS, ArcGIS Pro, WMS, FeatureServer; no hype; only verifiable claims (counts come from real data).
- **Next 16:** route `params` is a `Promise` — always `const { slug } = await params`. Check `node_modules/next/dist/docs/` before writing unfamiliar page code.
- Path alias `@/` maps to repo root (existing convention, see `app/guides/page.tsx`).
- Pipeline scripts are plain JS ESM `.mjs` with co-located `*.test.mjs` run by `node --test` (mirrors the extension repo's convention). No TypeScript in `scripts/`.
- Site pages follow existing conventions: per-page CSS module, `export const metadata` / `generateMetadata` with `alternates.canonical`, JSON-LD via inline `<script type="application/ld+json">`.
- Env vars used by the pipeline (never committed): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, optional `DIRECTORY_TARGET` (default 750).

## File Structure

```
scripts/build-directory/
  README.md              run instructions (Task 15)
  seed-candidates.json   hand-picked bootstrap service URLs (Task 8)
  harvest.mjs            stage 1: Supabase pull (or seed file) + live probe -> .work/harvest.json
  enrich.mjs             stage 2: heuristics + optional Haiku -> .work/enriched.json
  emit.mjs               stage 3: quality gate + slugs -> content/directory/*.json + index.json
  validate.mjs           standalone validator over content/directory/ (also runs pre-build)
  world-outline.mjs      one-time: fetch + simplify world land polygons -> components/directory/world-outline.json
  lib/slug.mjs           slugify, service slugs, place/theme slugs        (+ slug.test.mjs)
  lib/heuristics.mjs     type detect, bbox parse/sanity, domain place, ranking, quality score (+ heuristics.test.mjs)
  lib/probe.mjs          liveness + ESRI f=json + WMS GetCapabilities     (+ probe.test.mjs)
  lib/enrich-core.mjs    prompt building + LLM-result merging, pure       (+ enrich-core.test.mjs)
  lib/emit-core.mjs      record assembly, slug stability, schema validate (+ emit-core.test.mjs)
  .work/                 gitignored intermediate files

content/directory/
  <slug>.json            one per published service (generated, committed after review)
  index.json             compact search index (generated)
  removed.json           slugs/service_keys never to resurrect (hand-maintained, seeded empty)

lib/directory.ts         typed loader + hub/related derivation for the site
components/directory/
  ExtentMap.tsx          server: SVG bbox-over-world extent map
  world-outline.json     generated once by world-outline.mjs, committed
  LivePreview.tsx        client: click-to-load Leaflet preview
  ConnectSnippets.tsx    server: QGIS / ArcGIS Pro / Leaflet / Python blocks
  ServiceCard.tsx        server: shared card for hubs/search/landing
  DirectorySearch.tsx    client: search over imported index.json
  CopyButton.tsx         client: copy-to-clipboard for URLs/snippets
  directory.module.css   shared styles for the above

app/data/page.tsx  + data.module.css          landing: search, featured, hub links
app/data/[slug]/page.tsx + service.module.css datasheet
app/data/place/[place]/page.tsx               place hub  (shares hub.module.css)
app/data/theme/[theme]/page.tsx               theme hub
app/data/hub.module.css
app/data/opengraph-image.tsx                  section OG image (mirrors guides pattern)
```

Modified: `package.json` (scripts + deps), `.gitignore` (`scripts/build-directory/.work/`), `components/SiteHeader.tsx` (NAV entry), `app/sitemap.ts`, `AGENTS.md` (one note about generated content).

## Shared data contract

Every task consumes/produces this record shape (defined in the spec; TS type in Task 9, JS validator in Task 6):

```jsonc
{
  "slug": "usgs-national-map-topo-mapserver",
  "service_key": "ESRI MapServer:https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer",
  "type": "ESRI MapServer",            // extension detectServiceType vocabulary
  "url": "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer",
  "title": "USGS National Map topo",
  "description": "one-sentence enriched summary",
  "abstract": "original service abstract or omitted",
  "provider": "USGS",
  "place": { "country": "United States", "state": null, "confidence": "high" },
  "themes": [{ "name": "elevation", "confidence": "medium" }],
  "bbox": [-179.9, -14.4, 179.9, 71.4],  // WGS84 [minx,miny,maxx,maxy] or null
  "layers": [{ "id": 0, "name": "Topo", "title": "Topo", "geometry": "raster",
               "fields": [{ "name": "OBJECTID", "type": "esriFieldTypeOID", "alias": "OBJECTID" }],
               "feature_count": null }],
  "formats": ["PNG32"], "crs": ["EPSG:3857"],
  "cors_enabled": true, "response_ms": 240,
  "last_verified": "2026-07-24", "discovery_count": 1,
  "quality_score": 0.7,
  "enrichment": { "model": null, "date": "2026-07-24", "notes": "" }
}
```

`confidence` is `"high" | "medium" | "low"`. Theme names come from the fixed vocabulary in `lib/heuristics.mjs` (`THEMES`).

---

### Task 1: Pipeline scaffold and slug module

**Files:**
- Create: `scripts/build-directory/lib/slug.mjs`
- Create: `scripts/build-directory/lib/slug.test.mjs`
- Create: `content/directory/removed.json` (content: `[]`)
- Modify: `package.json` (scripts only)
- Modify: `.gitignore` (append `scripts/build-directory/.work/`)

**Interfaces:**
- Produces: `slugify(text) -> string`; `serviceSlug({ title, provider, url, type }) -> string`; `typeShort(type) -> string`; `placeSlug({ country, state }) -> string` (state hubs get `<state>-<country>`); `themeSlug(name) -> string` (alias of `slugify`).

- [ ] **Step 1: Write the failing tests**

```js
// scripts/build-directory/lib/slug.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, serviceSlug, placeSlug, typeShort } from './slug.mjs';

test('slugify lowercases, strips punctuation, collapses dashes', () => {
  assert.equal(slugify('Flood Hazard  (2024) - v2!'), 'flood-hazard-2024-v2');
  assert.equal(slugify('Māori land blocks'), 'maori-land-blocks'); // diacritics folded
});

test('typeShort maps extension vocabulary', () => {
  assert.equal(typeShort('ESRI MapServer'), 'mapserver');
  assert.equal(typeShort('ESRI FeatureServer'), 'featureserver');
  assert.equal(typeShort('OGC WMS'), 'wms');
  assert.equal(typeShort('XYZ Tiles'), 'tiles');
  assert.equal(typeShort('Something New'), 'service'); // unknown falls back
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

test('placeSlug: country alone, and state qualified by country', () => {
  assert.equal(placeSlug({ country: 'New Zealand', state: null }), 'new-zealand');
  assert.equal(placeSlug({ country: 'New Zealand', state: 'Canterbury' }), 'canterbury-new-zealand');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/build-directory/lib/slug.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `slug.mjs`**

```js
// scripts/build-directory/lib/slug.mjs
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/build-directory/lib/slug.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Wire package scripts, workdir ignore, removed.json**

In `package.json` `"scripts"`, add (leave existing entries untouched):

```json
"directory:harvest": "node scripts/build-directory/harvest.mjs",
"directory:enrich": "node scripts/build-directory/enrich.mjs",
"directory:emit": "node scripts/build-directory/emit.mjs",
"directory:validate": "node scripts/build-directory/validate.mjs",
"directory:test": "node --test scripts/build-directory/lib/"
```

Append to `.gitignore`:

```
scripts/build-directory/.work/
```

Create `content/directory/removed.json` containing exactly `[]`.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-directory content/directory/removed.json package.json .gitignore
git commit -m "Add directory pipeline scaffold and slug module"
```

---

### Task 2: Heuristics module

**Files:**
- Create: `scripts/build-directory/lib/heuristics.mjs`
- Create: `scripts/build-directory/lib/heuristics.test.mjs`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `THEMES` (string[]); `detectType(url) -> string|null`; `parseBbox(value) -> [n,n,n,n]|null`; `bboxIsSane(bbox) -> boolean`; `placeFromDomain(url) -> {country, state, confidence}|null`; `rankScore(row) -> number`; `qualityScore(record) -> number` (0..1).

- [ ] **Step 1: Write the failing tests**

```js
// scripts/build-directory/lib/heuristics.test.mjs
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
  assert.equal(bboxIsSane([-180, -90, 180, 90]), false);   // whole world: no place signal
  assert.equal(bboxIsSane([-179.9, -89, 179.9, 89]), false); // effectively whole world
  assert.equal(bboxIsSane([10, 5, 4, 8]), false);          // inverted
  assert.equal(bboxIsSane([200, 0, 210, 10]), false);      // out of range
  assert.equal(bboxIsSane(null), false);
});

test('placeFromDomain infers country from ccTLD-style government domains', () => {
  assert.deepEqual(placeFromDomain('https://gis.ecan.govt.nz/arcgis'),
    { country: 'New Zealand', state: null, confidence: 'high' });
  assert.deepEqual(placeFromDomain('https://data.gov.au/x'),
    { country: 'Australia', state: null, confidence: 'high' });
  assert.deepEqual(placeFromDomain('https://environment.data.gov.uk/x'),
    { country: 'United Kingdom', state: null, confidence: 'high' });
  assert.equal(placeFromDomain('https://services.arcgis.com/x'), null); // no signal
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/build-directory/lib/heuristics.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `heuristics.mjs`**

```js
// scripts/build-directory/lib/heuristics.mjs
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/build-directory/lib/heuristics.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-directory/lib/heuristics.mjs scripts/build-directory/lib/heuristics.test.mjs
git commit -m "Add directory heuristics: type detection, bbox, place, ranking, quality"
```

---

### Task 3: Probe module (liveness + capabilities)

**Files:**
- Create: `scripts/build-directory/lib/probe.mjs`
- Create: `scripts/build-directory/lib/probe.test.mjs`
- Modify: `package.json` (add devDependency `fast-xml-parser@^4`)

**Interfaces:**
- Consumes: `detectType` from `heuristics.mjs` (fallback typing).
- Produces: `probeService({ url, type }, fetchImpl = fetch) -> Promise<ProbeResult>` where `ProbeResult = { alive, response_ms, title, abstract, layers, formats, crs, bbox }`; `layers` items are `{ id, name, title, geometry, fields, feature_count }` (fields `{ name, type, alias }`). Failures never throw: `alive: false` on network error, metadata fields null/empty when a capabilities fetch fails but the root responded.
- All fetches use a 10 s `AbortSignal.timeout`; per-layer detail fetches are capped at the first 15 layers of max 60 listed; `feature_count` fetched only for ESRI FeatureServer layers (`query?where=1%3D1&returnCountOnly=true&f=json`).

- [ ] **Step 1: Install the XML parser**

Run: `npm install --save-dev fast-xml-parser@^4`

- [ ] **Step 2: Write the failing tests** (inject a stub `fetchImpl`; never hit the network in tests)

```js
// scripts/build-directory/lib/probe.test.mjs
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
  const r = await probeService({ url: 'https://gone.example/arcgis/rest/services/X/MapServer', type: 'ESRI MapServer' }, fetchImpl);
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `node --test scripts/build-directory/lib/probe.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 4: Implement `probe.mjs`**

Implementation notes (write real code, this is the shape):

```js
// scripts/build-directory/lib/probe.mjs
import { XMLParser } from 'fast-xml-parser';

const TIMEOUT_MS = 10_000;
const MAX_LAYERS = 60;
const MAX_LAYER_DETAIL = 15;

async function get(fetchImpl, url) {
  const started = Date.now();
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  return { res, ms: Date.now() - started };
}

function esriGeometry(g) {
  return ({ esriGeometryPoint: 'point', esriGeometryMultipoint: 'point',
    esriGeometryPolyline: 'line', esriGeometryPolygon: 'polygon' })[g] ?? (g ? 'other' : null);
}

async function probeEsri(fetchImpl, url, wantCounts) {
  const { res, ms } = await get(fetchImpl, `${url}?f=json`);
  const root = await res.json();
  if (root.error) return { alive: false };
  const listed = (root.layers ?? []).slice(0, MAX_LAYERS);
  const layers = [];
  for (const [i, l] of listed.entries()) {
    const layer = { id: l.id, name: l.name, title: l.name, geometry: esriGeometry(l.geometryType), fields: [], feature_count: null };
    if (i < MAX_LAYER_DETAIL) {
      try {
        const detail = await (await fetchImpl(`${url}/${l.id}?f=json`, { signal: AbortSignal.timeout(TIMEOUT_MS) })).json();
        layer.geometry = esriGeometry(detail.geometryType) ?? layer.geometry;
        layer.fields = (detail.fields ?? []).map((f) => ({ name: f.name, type: f.type, alias: f.alias ?? f.name }));
        if (wantCounts) {
          const c = await (await fetchImpl(`${url}/${l.id}/query?where=1%3D1&returnCountOnly=true&f=json`, { signal: AbortSignal.timeout(TIMEOUT_MS) })).json();
          if (Number.isFinite(c.count)) layer.feature_count = c.count;
        }
      } catch { /* detail is best-effort */ }
    }
    layers.push(layer);
  }
  const ext = root.fullExtent ?? root.extent;
  const bbox = ext && (ext.spatialReference?.wkid === 4326 || ext.spatialReference?.latestWkid === 4326)
    ? [ext.xmin, ext.ymin, ext.xmax, ext.ymax] : null;
  return {
    alive: true, response_ms: ms,
    title: root.mapName || root.name || root.documentInfo?.Title || null,
    abstract: root.description || root.serviceDescription || null,
    layers, formats: root.supportedImageFormatTypes ? root.supportedImageFormatTypes.split(',') : [],
    crs: root.spatialReference?.wkid ? [`EPSG:${root.spatialReference.wkid}`] : [], bbox,
  };
}

function wmsCapsUrl(url) {
  const base = url.split('?')[0];
  return `${base}?SERVICE=WMS&REQUEST=GetCapabilities`;
}

function flattenWmsLayers(node, out) {
  if (!node) return out;
  for (const l of [node].flat()) {
    if (l.Name && out.length < MAX_LAYERS) {
      const g = l.EX_GeographicBoundingBox;
      out.push({ id: l.Name, name: String(l.Name), title: String(l.Title ?? l.Name),
        geometry: null, fields: [], feature_count: null,
        _bbox: g ? [Number(g.westBoundLongitude), Number(g.southBoundLatitude),
          Number(g.eastBoundLongitude), Number(g.northBoundLatitude)] : null });
    }
    if (l.Layer) flattenWmsLayers(l.Layer, out);
  }
  return out;
}

async function probeWms(fetchImpl, url) {
  const { res, ms } = await get(fetchImpl, wmsCapsUrl(url));
  const parsed = new XMLParser({ ignoreAttributes: true }).parse(await res.text());
  const caps = parsed.WMS_Capabilities ?? parsed.WMT_MS_Capabilities;
  if (!caps) return { alive: false };
  const rootLayer = caps.Capability?.Layer;
  const layers = flattenWmsLayers(rootLayer, []);
  const bbox = layers.find((l) => l._bbox)?._bbox ?? null;
  for (const l of layers) delete l._bbox;
  const fmt = caps.Capability?.Request?.GetMap?.Format ?? [];
  const crs = [rootLayer?.CRS ?? rootLayer?.SRS ?? []].flat().map(String);
  return {
    alive: true, response_ms: ms,
    title: caps.Service?.Title ? String(caps.Service.Title) : null,
    abstract: caps.Service?.Abstract ? String(caps.Service.Abstract) : null,
    layers, formats: [fmt].flat().map(String), crs, bbox,
  };
}

export async function probeService({ url, type }, fetchImpl = fetch) {
  try {
    if (type?.startsWith('ESRI')) return await probeEsri(fetchImpl, url, type === 'ESRI FeatureServer');
    if (type === 'OGC WMS') return await probeWms(fetchImpl, url);
    // Tiles, vector tiles, WFS, OGC API: liveness only in v1.
    const { res, ms } = await get(fetchImpl, url);
    return { alive: res.ok, response_ms: ms, title: null, abstract: null,
      layers: [], formats: [], crs: [], bbox: null };
  } catch {
    return { alive: false, response_ms: null, title: null, abstract: null,
      layers: [], formats: [], crs: [], bbox: null };
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test scripts/build-directory/lib/probe.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add scripts/build-directory/lib/probe.mjs scripts/build-directory/lib/probe.test.mjs package.json package-lock.json
git commit -m "Add service probe: ESRI f=json and WMS GetCapabilities readers"
```

---

### Task 4: Harvest stage

**Files:**
- Create: `scripts/build-directory/harvest.mjs`
- Create: `scripts/build-directory/lib/harvest-core.mjs`
- Create: `scripts/build-directory/lib/harvest-core.test.mjs`

**Interfaces:**
- Consumes: `rankScore`, `detectType`, `parseBbox` (heuristics), `probeService` (probe).
- Produces: `.work/harvest.json` — array of `{ raw, probe }` where `raw` is the Supabase row (or synthesized seed row) and `probe` is a `ProbeResult`. Pure logic in `harvest-core.mjs`: `selectCandidates(rows, target) -> rows` (rank, dedupe by `normalized_url`, take `ceil(target * 1.5)`), `seedRow(url) -> row` (synthesizes `{ normalized_url, service_type: detectType(url), original_urls: [url], discovery_count: 1 }`).
- CLI: `node scripts/build-directory/harvest.mjs [--seed scripts/build-directory/seed-candidates.json]`. Without `--seed`, requires `SUPABASE_URL` + `SUPABASE_ANON_KEY`; fetches `GET {SUPABASE_URL}/rest/v1/global_service_directory?select=*&order=discovery_count.desc.nullslast&limit=2000` with headers `apikey` and `Authorization: Bearer <key>`. Probes candidates with concurrency 6, keeps only `alive`, truncates to `DIRECTORY_TARGET` (default 750), writes `.work/harvest.json`, prints kept/dropped counts (spec: no silent truncation).

- [ ] **Step 1: Write failing tests for the pure core**

```js
// scripts/build-directory/lib/harvest-core.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectCandidates, seedRow } from './harvest-core.mjs';

test('selectCandidates ranks by rankScore, dedupes by normalized_url, caps at 1.5x target', () => {
  const rows = [
    { normalized_url: 'https://a', discovery_count: 1 },
    { normalized_url: 'https://a', discovery_count: 9, service_title: 'T' }, // dupe, richer
    { normalized_url: 'https://b', discovery_count: 5, service_title: 'T', service_abstract: 'A' },
    { normalized_url: 'https://c', discovery_count: 0 },
  ];
  const picked = selectCandidates(rows, 2); // cap = ceil(2 * 1.5) = 3
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/build-directory/lib/harvest-core.test.mjs` — expected FAIL.

- [ ] **Step 3: Implement `harvest-core.mjs`**

```js
// scripts/build-directory/lib/harvest-core.mjs
import { rankScore, detectType } from './heuristics.mjs';

export function selectCandidates(rows, target) {
  const byUrl = new Map();
  for (const row of rows) {
    const key = row.normalized_url;
    if (!key) continue;
    const existing = byUrl.get(key);
    if (!existing || rankScore(row) > rankScore(existing)) byUrl.set(key, row);
  }
  return [...byUrl.values()]
    .sort((a, b) => rankScore(b) - rankScore(a))
    .slice(0, Math.ceil(target * 1.5));
}

export function seedRow(url) {
  return {
    normalized_url: url, service_type: detectType(url),
    original_urls: [url], discovery_count: 1,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass, then write `harvest.mjs`**

`harvest.mjs` is CLI glue (no unit tests; exercised in Task 8's seed run):

```js
// scripts/build-directory/harvest.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { selectCandidates, seedRow } from './lib/harvest-core.mjs';
import { probeService } from './lib/probe.mjs';

const TARGET = Number(process.env.DIRECTORY_TARGET ?? 750);
const seedIdx = process.argv.indexOf('--seed');

async function loadRows() {
  if (seedIdx !== -1) {
    const file = process.argv[seedIdx + 1];
    const urls = JSON.parse(await readFile(file, 'utf8'));
    return urls.map(seedRow);
  }
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY, or pass --seed <file>.');
    process.exit(1);
  }
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/global_service_directory?select=*&order=discovery_count.desc.nullslast&limit=2000`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
  );
  if (!res.ok) { console.error(`Supabase ${res.status}: ${await res.text()}`); process.exit(1); }
  return res.json();
}

const rows = await loadRows();
const candidates = selectCandidates(rows, TARGET);
console.log(`rows: ${rows.length}, candidates after ranking: ${candidates.length}`);

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < candidates.length) {
    const raw = candidates[cursor++];
    const url = raw.normalized_url;
    const probe = await probeService({ url, type: raw.service_type }, fetch);
    results.push({ raw, probe });
    process.stdout.write(probe.alive ? '.' : 'x');
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log('');

const alive = results.filter((r) => r.probe.alive).slice(0, TARGET);
console.log(`alive: ${alive.length}, dead (dropped): ${results.length - alive.length}`);
await mkdir(new URL('./.work/', import.meta.url), { recursive: true });
await writeFile(new URL('./.work/harvest.json', import.meta.url), JSON.stringify(alive, null, 2));
console.log(`wrote .work/harvest.json`);
```

- [ ] **Step 5: Run the full pipeline test suite**

Run: `npm run directory:test` — expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-directory/harvest.mjs scripts/build-directory/lib/harvest-core.mjs scripts/build-directory/lib/harvest-core.test.mjs
git commit -m "Add harvest stage: Supabase or seed candidates, live probe, workfile"
```

---

### Task 5: Enrich stage (heuristics + optional Haiku)

**Files:**
- Create: `scripts/build-directory/lib/enrich-core.mjs`
- Create: `scripts/build-directory/lib/enrich-core.test.mjs`
- Create: `scripts/build-directory/enrich.mjs`

**Interfaces:**
- Consumes: `.work/harvest.json` entries (`{ raw, probe }`); heuristics (`parseBbox`, `bboxIsSane`, `placeFromDomain`, `THEMES`).
- Produces: `.work/enriched.json` — array of `{ raw, probe, meaning }` where `meaning = { title, description, abstract, provider, place, themes }`. Pure functions: `baseMeaning({ raw, probe }) -> meaning` (heuristics only), `needsLlm(meaning) -> boolean`, `buildPrompt({ raw, probe }) -> string`, `mergeLlm(meaning, llmJson) -> meaning`.
- Merge rules (spec): heuristic high-confidence place beats LLM; LLM `place.confidence` is capped at `medium` unless it agrees with a domain-rule country (then `high`); themes restricted to `THEMES`, max 3, unknown names dropped; LLM description used only when the record has none; `unknown` country -> `place: null`.
- CLI: reads `ANTHROPIC_API_KEY`; if unset, prints a warning and writes heuristics-only output (valid per spec). Model: `claude-haiku-4-5-20251001`, `max_tokens: 400`, temperature 0, concurrency 4, one retry on 429/5xx.

- [ ] **Step 1: Write failing tests**

```js
// scripts/build-directory/lib/enrich-core.test.mjs
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

test('mergeLlm: domain-confirmed country upgraded to high; heuristic place wins; themes filtered', () => {
  const m = baseMeaning(entry);
  const merged = mergeLlm(m, {
    description: 'Flood hazard extents for Canterbury.',
    place: { country: 'New Zealand', state: 'Canterbury', confidence: 'high' },
    themes: [{ name: 'flood', confidence: 'high' }, { name: 'not-a-theme', confidence: 'high' }],
  });
  assert.equal(merged.description, 'Flood hazard extents for Canterbury.');
  // Heuristic said NZ (high). LLM agrees and adds state: state accepted, confidence stays high.
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
```

- [ ] **Step 2: Run tests to verify they fail** — `node --test scripts/build-directory/lib/enrich-core.test.mjs`.

- [ ] **Step 3: Implement `enrich-core.mjs`**

```js
// scripts/build-directory/lib/enrich-core.mjs
import { placeFromDomain, parseBbox, THEMES } from './heuristics.mjs';

export function baseMeaning({ raw, probe }) {
  return {
    title: probe.title ?? raw.service_title ?? null,
    description: null,
    abstract: probe.abstract ?? raw.service_abstract ?? null,
    provider: raw.provider_name ?? raw.service_provider ?? null,
    place: placeFromDomain(raw.normalized_url),
    themes: [],
  };
}

export function needsLlm(meaning) {
  return !meaning.description || meaning.themes.length === 0 || !meaning.place;
}

export function buildPrompt({ raw, probe }) {
  const layerNames = probe.layers.map((l) => l.name).slice(0, 30);
  const fieldNames = probe.layers.flatMap((l) => (l.fields ?? []).map((f) => f.name)).slice(0, 40);
  const bbox = probe.bbox ?? raw.bounding_box ?? null;
  return [
    'You classify a public GIS service. Reply with ONLY a JSON object, no prose:',
    '{"description": "<one plain sentence, max 25 words, no hype>",',
    ' "place": {"country": "<English country name or unknown>", "state": "<region/state or null>", "confidence": "high|medium|low"},',
    ` "themes": [{"name": "<one of: ${THEMES.join(', ')}>", "confidence": "high|medium|low"}]}`,
    'Max 3 themes. Use only listed theme names. If unsure of country, use "unknown".',
    '',
    `URL: ${raw.normalized_url}`,
    `Type: ${raw.service_type ?? ''}`,
    `Title: ${probe.title ?? raw.service_title ?? ''}`,
    `Abstract: ${(probe.abstract ?? raw.service_abstract ?? '').slice(0, 500)}`,
    `Provider: ${raw.provider_name ?? ''}`,
    `Layers: ${layerNames.join('; ')}`,
    `Fields: ${fieldNames.join(', ')}`,
    `BBox (WGS84 minx,miny,maxx,maxy): ${bbox ?? 'unknown'}`,
  ].join('\n');
}

export function mergeLlm(meaning, llm) {
  const out = { ...meaning };
  if (!out.description && typeof llm.description === 'string') out.description = llm.description.trim();
  const llmPlace = llm.place;
  if (llmPlace && llmPlace.country && llmPlace.country !== 'unknown') {
    if (out.place && out.place.confidence === 'high') {
      // Heuristic wins; accept the LLM state only when countries agree.
      if (llmPlace.country === out.place.country && llmPlace.state) {
        out.place = { ...out.place, state: llmPlace.state };
      }
    } else {
      out.place = { country: llmPlace.country, state: llmPlace.state ?? null, confidence: 'medium' };
    }
  }
  const themes = Array.isArray(llm.themes) ? llm.themes : [];
  out.themes = themes
    .filter((t) => THEMES.includes(t?.name))
    .slice(0, 3)
    .map((t) => ({ name: t.name, confidence: ['high', 'medium', 'low'].includes(t.confidence) ? t.confidence : 'low' }));
  return out;
}
```

- [ ] **Step 4: Run tests to verify they pass** — expected PASS.

- [ ] **Step 5: Write `enrich.mjs` CLI**

```js
// scripts/build-directory/enrich.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { baseMeaning, needsLlm, buildPrompt, mergeLlm } from './lib/enrich-core.mjs';

const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-haiku-4-5-20251001';

async function askHaiku(prompt) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 400, temperature: 0,
        messages: [{ role: 'user', content: prompt }] }),
    });
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2000)); continue; }
    if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
    const body = await res.json();
    const text = body.content?.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]); } catch { return null; }
  }
  return null;
}

const entries = JSON.parse(await readFile(new URL('./.work/harvest.json', import.meta.url), 'utf8'));
if (!KEY) console.warn('ANTHROPIC_API_KEY not set: writing heuristics-only output.');

let cursor = 0; let llmCalls = 0;
const out = new Array(entries.length);
async function worker() {
  while (cursor < entries.length) {
    const i = cursor++;
    const entry = entries[i];
    let meaning = baseMeaning(entry);
    if (KEY && needsLlm(meaning)) {
      const llm = await askHaiku(buildPrompt(entry));
      llmCalls++;
      if (llm) meaning = mergeLlm(meaning, llm);
    }
    out[i] = { ...entry, meaning };
    process.stdout.write('.');
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(`\nenriched ${out.length} records (${llmCalls} model calls)`);
await writeFile(new URL('./.work/enriched.json', import.meta.url), JSON.stringify(out, null, 2));
```

- [ ] **Step 6: Run the suite and commit**

Run: `npm run directory:test` — all PASS.

```bash
git add scripts/build-directory/enrich.mjs scripts/build-directory/lib/enrich-core.mjs scripts/build-directory/lib/enrich-core.test.mjs
git commit -m "Add enrich stage: heuristics plus optional Haiku classification"
```

---

### Task 6: Emit stage and schema validator

**Files:**
- Create: `scripts/build-directory/lib/emit-core.mjs`
- Create: `scripts/build-directory/lib/emit-core.test.mjs`
- Create: `scripts/build-directory/emit.mjs`

**Interfaces:**
- Consumes: `.work/enriched.json` entries (`{ raw, probe, meaning }`), `serviceSlug` (slug.mjs), `parseBbox`, `bboxIsSane`, `qualityScore` (heuristics.mjs).
- Produces: `content/directory/<slug>.json` records (shared data contract), `content/directory/index.json`. Pure functions: `buildRecord(entry, today) -> record|null` (null when the quality gate fails), `assignSlug(record, existingBySlugKey, removed) -> string|null` (null when suppressed by `removed.json`), `buildIndex(records) -> indexEntries`, `validateRecord(record) -> string[]` (empty = valid; used again by Task 7).
- Quality gate (spec): `alive`, has `title`, has `description` (fall back to first sentence of abstract), `layers.length > 0` unless type is tiles/WMS/image, `quality_score >= 0.5`.
- Slug stability (spec): if an existing file's `service_key` matches, reuse its slug; never rewrite existing slugs; on collision with a *different* service, append `-2`, `-3`, ...; skip records whose slug or `service_key` is in `removed.json`.

- [ ] **Step 1: Write failing tests**

```js
// scripts/build-directory/lib/emit-core.test.mjs
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
  const taken = new Map([['other-key', record.slug]]); // same slug, different service
  const bySlug = new Map([...taken].map(([k, v]) => [v, k]));
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
```

- [ ] **Step 2: Run tests to verify they fail** — `node --test scripts/build-directory/lib/emit-core.test.mjs`.

- [ ] **Step 3: Implement `emit-core.mjs`**

```js
// scripts/build-directory/lib/emit-core.mjs
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
  if (probe.layers.length === 0 && !NO_LAYER_TYPES.has(raw.service_type)) return null;

  const bboxCandidate = probe.bbox ?? parseBbox(raw.bounding_box);
  const record = {
    slug: serviceSlug({ title, provider: meaning.provider, url: raw.normalized_url, type: raw.service_type }),
    service_key: `${raw.service_type}:${raw.normalized_url}`,
    type: raw.service_type,
    url: raw.normalized_url,
    title,
    description,
    ...(meaning.abstract ? { abstract: meaning.abstract } : {}),
    ...(meaning.provider ? { provider: meaning.provider } : {}),
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
```

- [ ] **Step 4: Run tests to verify they pass**, then write `emit.mjs` CLI: read `.work/enriched.json`, read existing `content/directory/*.json` into `existingByKey` (slug by `service_key`) and `takenBySlug`, read `removed.json`, loop `buildRecord` -> `assignSlug` -> write `content/directory/<slug>.json` (2-space JSON, trailing newline), collect kept records, write `index.json` from `buildIndex`, print counts: built, gated out, suppressed, slug reuses. Existing files whose `service_key` is absent from this batch are left untouched (a batch refreshes, it never deletes; deletion is manual per spec).

```js
// scripts/build-directory/emit.mjs
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { buildRecord, assignSlug, buildIndex, validateRecord } from './lib/emit-core.mjs';

const CONTENT = new URL('../../content/directory/', import.meta.url);
const today = new Date().toISOString().slice(0, 10);

const entries = JSON.parse(await readFile(new URL('./.work/enriched.json', import.meta.url), 'utf8'));
const removed = JSON.parse(await readFile(new URL('removed.json', CONTENT), 'utf8'));

const existingByKey = new Map(); const takenBySlug = new Map(); const untouched = new Map();
for (const file of await readdir(CONTENT)) {
  if (!file.endsWith('.json') || file === 'index.json' || file === 'removed.json') continue;
  const rec = JSON.parse(await readFile(new URL(file, CONTENT), 'utf8'));
  existingByKey.set(rec.service_key, rec.slug);
  takenBySlug.set(rec.slug, rec.service_key);
  untouched.set(rec.service_key, rec);
}

let gated = 0, suppressed = 0, written = 0;
const batch = new Map();
for (const entry of entries) {
  const record = buildRecord(entry, today);
  if (!record) { gated++; continue; }
  const slug = assignSlug(record, existingByKey, removed, takenBySlug);
  if (!slug) { suppressed++; continue; }
  record.slug = slug;
  takenBySlug.set(slug, record.service_key);
  const errors = validateRecord(record);
  if (errors.length) { console.error(`${slug}: ${errors.join('; ')}`); gated++; continue; }
  await writeFile(new URL(`${slug}.json`, CONTENT), JSON.stringify(record, null, 2) + '\n');
  batch.set(record.service_key, record);
  untouched.delete(record.service_key);
  written++;
}

const all = [...batch.values(), ...untouched.values()];
await writeFile(new URL('index.json', CONTENT), JSON.stringify(buildIndex(all), null, 2) + '\n');
console.log(`written: ${written}, gated out: ${gated}, suppressed: ${suppressed}, carried over: ${untouched.size}`);
console.log('Review the git diff, delete anything that should not ship, then commit.');
```

- [ ] **Step 5: Run the suite** — `npm run directory:test` — all PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-directory/emit.mjs scripts/build-directory/lib/emit-core.mjs scripts/build-directory/lib/emit-core.test.mjs
git commit -m "Add emit stage: quality gate, stable slugs, index, validation"
```

---

### Task 7: Standalone validator wired into the build

**Files:**
- Create: `scripts/build-directory/validate.mjs`
- Modify: `package.json` (`"build"` script)

**Interfaces:**
- Consumes: `validateRecord` from `emit-core.mjs`; `content/directory/`.
- Produces: exit 0 with per-file check summary, exit 1 listing every violation. Checks: every `*.json` (except `index.json`, `removed.json`) passes `validateRecord`; filename equals `record.slug + '.json'`; slugs unique; every `index.json` entry has a matching record file and vice versa. An empty `content/directory/` (only `removed.json`) is valid (site renders an empty-state, Task 12).

- [ ] **Step 1: Implement `validate.mjs`**

```js
// scripts/build-directory/validate.mjs
import { readdir, readFile } from 'node:fs/promises';
import { validateRecord } from './lib/emit-core.mjs';

const CONTENT = new URL('../../content/directory/', import.meta.url);
const problems = [];
const slugs = new Set();
const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.json') && f !== 'index.json' && f !== 'removed.json');

for (const file of files) {
  const record = JSON.parse(await readFile(new URL(file, CONTENT), 'utf8'));
  for (const e of validateRecord(record)) problems.push(`${file}: ${e}`);
  if (file !== `${record.slug}.json`) problems.push(`${file}: filename does not match slug ${record.slug}`);
  if (slugs.has(record.slug)) problems.push(`${file}: duplicate slug`);
  slugs.add(record.slug);
}

let indexEntries = [];
try { indexEntries = JSON.parse(await readFile(new URL('index.json', CONTENT), 'utf8')); }
catch { if (files.length > 0) problems.push('index.json missing while records exist'); }
for (const e of indexEntries) if (!slugs.has(e.slug)) problems.push(`index.json: ${e.slug} has no record file`);
for (const s of slugs) if (!indexEntries.some((e) => e.slug === s)) problems.push(`index.json: missing ${s}`);

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`content/directory valid: ${files.length} records`);
```

- [ ] **Step 2: Run it against the current (empty) directory**

Run: `npm run directory:validate`
Expected: `content/directory valid: 0 records`, exit 0.

- [ ] **Step 3: Gate the site build on it**

In `package.json`, change `"build": "next build"` to:

```json
"build": "node scripts/build-directory/validate.mjs && next build"
```

Run `npm run build` once to confirm the chain works (site still builds with zero records — `/data` routes do not exist yet, so this validates the script chain only).

- [ ] **Step 4: Commit**

```bash
git add scripts/build-directory/validate.mjs package.json
git commit -m "Validate directory content before every site build"
```

---

### Task 8: Seed run — real data via the pipeline

**Files:**
- Create: `scripts/build-directory/seed-candidates.json`
- Create (generated): `content/directory/*.json`, `content/directory/index.json`

**Interfaces:**
- Produces: the first committed records; every later task renders real data. No hand-written records — the pipeline is the only author (spec: facts must be real).

- [ ] **Step 1: Create the seed list** — stable, well-known public services:

```json
[
  "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer",
  "https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer",
  "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer",
  "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties_Generalized_Boundaries/FeatureServer",
  "https://ows.terrestris.de/osm/service?SERVICE=WMS&REQUEST=GetCapabilities",
  "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?SERVICE=WMS&REQUEST=GetCapabilities",
  "https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer",
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer"
]
```

- [ ] **Step 2: Run the pipeline in seed mode**

```bash
npm run directory:harvest -- --seed scripts/build-directory/seed-candidates.json
npm run directory:enrich     # heuristics-only if ANTHROPIC_API_KEY unset; set it if available
npm run directory:emit
npm run directory:validate
```

Expected: several records written (dead seeds are dropped and reported — that is correct behaviour, not failure). Inspect `git diff --stat` and open one record to sanity-check facts.

- [ ] **Step 3: Review and commit the generated content**

```bash
git add scripts/build-directory/seed-candidates.json content/directory
git commit -m "Seed the directory with pipeline-built records for known public services"
```

---

### Task 9: Site loader `lib/directory.ts`

**Files:**
- Create: `lib/directory.ts`

**Interfaces:**
- Consumes: `content/directory/*.json` via `fs` at build time (server-only module; imported from server components only).
- Produces (exact signatures used by Tasks 10-14):

```ts
export type Confidence = 'high' | 'medium' | 'low';
export type DirectoryField = { name: string; type: string; alias?: string };
export type DirectoryLayer = { id: number | string; name: string; title?: string;
  geometry?: string | null; fields: DirectoryField[]; feature_count?: number | null };
export type DirectoryPlace = { country: string; state?: string | null; confidence: Confidence };
export type DirectoryService = { slug: string; service_key: string; type: string; url: string;
  title: string; description: string; abstract?: string; provider?: string;
  place: DirectoryPlace | null; themes: { name: string; confidence: Confidence }[];
  bbox: [number, number, number, number] | null; layers: DirectoryLayer[];
  formats: string[]; crs: string[]; cors_enabled: boolean | null; response_ms: number | null;
  last_verified: string; discovery_count: number; quality_score: number };
export type Hub = { slug: string; label: string; services: DirectoryService[] };

export function getAllServices(): DirectoryService[];          // sorted by title
export function getService(slug: string): DirectoryService | undefined;
export function placeHubs(): Hub[];   // confidence high|medium only; >= 3 members; country and state hubs
export function themeHubs(): Hub[];   // confidence high|medium only; >= 3 members
export function relatedTo(s: DirectoryService): { provider: DirectoryService[]; place: DirectoryService[]; theme: DirectoryService[] }; // <= 5 each, never contains s
export function featured(count: number): DirectoryService[];   // top by quality_score then discovery_count
```

- [ ] **Step 1: Implement**

Implementation notes: `readdirSync`/`readFileSync` on `path.join(process.cwd(), 'content/directory')`, skip `index.json`/`removed.json`, cache in a module-level variable. Hub labels: country hubs use the country name; state hubs use `"<State>, <Country>"`; theme hubs use the theme slug with dashes replaced by spaces, sentence case. Reuse `placeSlug` logic inline (TS reimplementation is four lines; do not import `.mjs` into TS). Header comment mirrors `lib/guides.ts` style: explain that a record exists because a reviewed file is committed, and how to regenerate.

- [ ] **Step 2: Verify with the TypeScript compiler**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/directory.ts
git commit -m "Add typed loader and hub derivation for directory content"
```

---

### Task 10: ExtentMap SVG component

**Files:**
- Create: `scripts/build-directory/world-outline.mjs` (one-time generator)
- Create (generated): `components/directory/world-outline.json`
- Create: `components/directory/ExtentMap.tsx`
- Create: `components/directory/directory.module.css` (started here, grown by later tasks)

**Interfaces:**
- Consumes: `DirectoryService['bbox']`.
- Produces: `<ExtentMap bbox={bbox} title={string} />` — server component rendering an inline SVG: equirectangular frame (2:1, viewBox `0 0 720 360`, x = `(lon + 180) * 2`, y = `(90 - lat) * 2`), world land outline paths, 30-degree graticule hairlines, the bbox as a 2px ink rectangle (minimum rendered size 6px so small extents stay visible), and mono corner labels with the bbox coordinates (design-brief cartographic garnish). `bbox === null` renders the frame with a centred `.gh-label` reading "Extent not published by this service".

- [ ] **Step 1: Write and run the outline generator**

```js
// scripts/build-directory/world-outline.mjs
// One-time: fetch Natural Earth 110m land (GeoJSON via world-atlas CDN is topojson;
// use the geojson mirror), round to 1 decimal, drop rings under 12 points, save.
const SRC = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_land.json';
import { writeFile } from 'node:fs/promises';
const geo = await (await fetch(SRC)).json();
const rings = [];
for (const f of geo.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    const ring = poly[0].map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
    if (ring.length >= 12) rings.push(ring);
  }
}
await writeFile(new URL('../../components/directory/world-outline.json', import.meta.url),
  JSON.stringify(rings));
console.log(`rings: ${rings.length}`);
```

Run: `node scripts/build-directory/world-outline.mjs` — expect a file of roughly 5-15 KB. If the source URL is unavailable, use any Natural Earth 110m land GeoJSON and note the substitution in the commit message.

- [ ] **Step 2: Implement `ExtentMap.tsx`**

```tsx
// components/directory/ExtentMap.tsx
import rings from './world-outline.json';
import styles from './directory.module.css';

const X = (lon: number) => (lon + 180) * 2;
const Y = (lat: number) => (90 - lat) * 2;

function ringPath(ring: number[][]) {
  return ring.map(([lon, lat], i) => `${i === 0 ? 'M' : 'L'}${X(lon)} ${Y(lat)}`).join('') + 'Z';
}

export function ExtentMap({ bbox, title }: {
  bbox: [number, number, number, number] | null; title: string;
}) {
  return (
    <figure className={styles.extent}>
      <svg viewBox="0 0 720 360" role="img"
        aria-label={bbox ? `Coverage extent of ${title}` : `Extent unknown for ${title}`}>
        <rect x="0" y="0" width="720" height="360" className={styles.extentFrame} />
        {Array.from({ length: 11 }, (_, i) => (i + 1) * 30).map((lon) => (
          <line key={`x${lon}`} x1={lon * 2} y1={0} x2={lon * 2} y2={360} className={styles.graticule} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (i + 1) * 30).map((lat) => (
          <line key={`y${lat}`} x1={0} y1={lat * 2} x2={720} y2={lat * 2} className={styles.graticule} />
        ))}
        {(rings as number[][][]).map((ring, i) => (
          <path key={i} d={ringPath(ring)} className={styles.land} />
        ))}
        {bbox && (
          <rect
            x={X(bbox[0])} y={Y(bbox[3])}
            width={Math.max(6, X(bbox[2]) - X(bbox[0]))}
            height={Math.max(6, Y(bbox[1]) - Y(bbox[3]))}
            className={styles.extentBox}
          />
        )}
      </svg>
      <figcaption className={styles.extentCaption}>
        {bbox
          ? `${bbox[0].toFixed(1)}, ${bbox[1].toFixed(1)} to ${bbox[2].toFixed(1)}, ${bbox[3].toFixed(1)} (WGS84)`
          : 'Extent not published by this service'}
      </figcaption>
    </figure>
  );
}
```

Styles in `directory.module.css` (consume tokens; hairline strokes; `.land` fill uses a muted token colour, `.extentBox` stroke 2px ink / lime in dark, fill transparent; `.extentCaption` uses `var(--gh-mono)`).

- [ ] **Step 3: Verify** — `npx tsc --noEmit` clean (JSON import needs `resolveJsonModule`; it is on in Next TS config by default — confirm, and if absent add it to `tsconfig.json` `compilerOptions`).

- [ ] **Step 4: Commit**

```bash
git add scripts/build-directory/world-outline.mjs components/directory
git commit -m "Add SVG extent map with generated world outline"
```

---

### Task 11: Datasheet page `/data/[slug]` with snippets and copy button

**Files:**
- Create: `app/data/[slug]/page.tsx`, `app/data/[slug]/service.module.css`
- Create: `components/directory/ConnectSnippets.tsx`
- Create: `components/directory/CopyButton.tsx`
- Modify: `components/directory/directory.module.css` (facts/snippet styles)

**Interfaces:**
- Consumes: `getAllServices`, `getService`, `relatedTo` (lib/directory.ts); `ExtentMap`; `CONTACT_EMAIL`, `SITE_URL` (constants); `InstallCta`.
- Produces: static pages for every record; `<ConnectSnippets service={DirectoryService} />`; `<CopyButton text={string} label={string} />` (client, clipboard API, "Copied" state for 2 s, no icon dependency).

- [ ] **Step 1: Implement `CopyButton.tsx`**

```tsx
'use client';
import { useState } from 'react';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" className="gh-btn"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}>
      {copied ? 'Copied' : label}
    </button>
  );
}
```

- [ ] **Step 2: Implement `ConnectSnippets.tsx`** (server). Section heading "Use this service", one `gh-card` per client with a mono `<pre>` and a `CopyButton`. Content per service type:
  - **QGIS**: for `OGC WMS`: `Layer > Add Layer > Add WMS/WMTS Layer > New, URL: <url>`; for ESRI types: `Layer > Add Layer > Add ArcGIS REST Server Layer, URL: <url>`; for `OGC WFS` and `OGC API - Features`: the WFS connection dialog with `<url>`.
  - **ArcGIS Pro**: `Insert > Connections > Server > New ArcGIS Server` (ESRI) or `New WMS Server` (WMS) with `<url>`.
  - **Leaflet**: WMS -> `L.tileLayer.wms('<url>', { layers: '<first layer name>' })`; XYZ -> `L.tileLayer('<url>')`; FeatureServer -> `fetch('<url>/0/query?where=1%3D1&outFields=*&f=geojson')` then `L.geoJSON`.
  - **Python**: FeatureServer/WFS -> `geopandas.read_file("<geojson query url>")`; WMS -> a `requests` GetMap example.
  Only render the snippets that apply to the record's type. All URLs come from `service.url` — never hard-coded.

- [ ] **Step 3: Implement the page** (structure per spec section "Service page"; key skeleton):

```tsx
// app/data/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllServices, getService, relatedTo } from '@/lib/directory';
import { SITE_URL, CONTACT_EMAIL } from '@/lib/constants';
import { ExtentMap } from '@/components/directory/ExtentMap';
import { LivePreview } from '@/components/directory/LivePreview';
import { ConnectSnippets } from '@/components/directory/ConnectSnippets';
import { CopyButton } from '@/components/directory/CopyButton';
import { InstallCta } from '@/components/InstallCta';
import styles from './service.module.css';

export function generateStaticParams() {
  return getAllServices().map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: `${s.title}: live ${s.type} datasheet`,
    description: s.description,
    alternates: { canonical: `/data/${s.slug}` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const related = relatedTo(s);
  // Sections, in order (see spec): header, ExtentMap + LivePreview, facts panel,
  // layers with expandable field tables (details/summary, no JS), ConnectSnippets,
  // related links, footer strip with InstallCta and the report link:
  // <a href={`mailto:${CONTACT_EMAIL}?subject=Directory listing: ${s.slug}`}>Report an issue with this listing</a>
  // Plus JSON-LD: @type Dataset { name, description, url, distribution: { contentUrl: s.url } }.
  // Facts panel rows include s.url in mono with <CopyButton text={s.url} />.
  // Layers table caps visible rows at 15 inside a <details> named "All N layers".
}
```

Fill the body completely: header block (`.gh-label` type badge, h1 title sentence case, provider line, place/theme tags linking to their hubs when confidence is not `low`), facts as a `dl` in a `gh-card`, layers as a table (name, title, geometry, field count) each row expandable via `<details>` to a fields table (name, alias, type), dates rendered as plain ISO. `LivePreview` is rendered next to `ExtentMap` only when `s.cors_enabled === true || s.type includes tiles/WMS/ImageServer` (mirror the spec rule; pass `service` props: `url`, `type`, `bbox`, first layer name/id). Where the preview is not possible, render one sentence: "Live preview is not available: this server does not send CORS headers. The QGIS connection below works regardless."

- [ ] **Step 4: Build and eyeball**

Run: `npm run build`
Expected: one static page per seeded record under `/data/<slug>`; no build errors. Then `npm run dev`, open one page, check both themes with the header toggle.

- [ ] **Step 5: Commit**

```bash
git add app/data components/directory
git commit -m "Add service datasheet pages with facts, layers, connect snippets"
```

---

### Task 12: LivePreview Leaflet component

**Files:**
- Create: `components/directory/LivePreview.tsx`
- Modify: `package.json` (deps `leaflet@^1.9.4`, devDep `@types/leaflet@^1.9`)

**Interfaces:**
- Consumes: props `{ url, type, bbox, layerName, layerId }` from the datasheet page.
- Produces: a `gh-card` region with a "Load live preview" `gh-btn`; on click, dynamic `import('leaflet')` + `import('leaflet/dist/leaflet.css')`, then by type:
  - `OGC WMS`: `L.tileLayer.wms(baseUrl, { layers: layerName, format: 'image/png', transparent: true })`
  - `XYZ Tiles`: `L.tileLayer(url)`
  - `ESRI MapServer` (tiled or not): `L.tileLayer(`${url}/tile/{z}/{y}/{x}`)`, and on `tileerror` fall back to the export endpoint disabled state (show note)
  - `ESRI ImageServer`: `L.tileLayer(`${url}/exportImage?bbox={bbox}&bboxSR=4326&size=256,256&f=image`)` via an `L.TileLayer.WMS`-free approach: use `L.imageOverlay` on the bbox with a single `exportImage` request (one request, polite)
  - `ESRI FeatureServer` / `OGC WFS` (only rendered when `cors_enabled`): `fetch(`${url}/${layerId ?? 0}/query?where=1%3D1&outFields=*&resultRecordCount=500&f=geojson`)` -> `L.geoJSON` with a 2px ink style; WFS uses `?service=WFS&request=GetFeature&outputFormat=application/json&count=500`
  - Attribution control on, zoom to `bbox` when present else world; map height 360px; a "Remove preview" button destroys the map (`map.remove()`) so long pages stay light.
- One fetch failure path: catch and render "The service did not respond to a preview request. It may still work in QGIS." — never a blank card.

- [ ] **Step 1: Install deps** — `npm install leaflet@^1.9.4 && npm install --save-dev @types/leaflet@^1.9`

- [ ] **Step 2: Implement** as described; `'use client'`; hold the map instance in a `useRef`; state machine `idle -> loading -> ready | failed`. Leaflet CSS is imported dynamically inside the click handler alongside the module, so nothing ships in the initial bundle.

- [ ] **Step 3: Verify in dev** — `npm run dev`, load a WMS record page and an ESRI record page, click the preview, watch tiles render (network access to the origin servers is expected here; this is a manual check, not a test).

- [ ] **Step 4: Commit**

```bash
git add components/directory/LivePreview.tsx package.json package-lock.json
git commit -m "Add click-to-load Leaflet live preview"
```

---### Task 13: ServiceCard, hubs, and search

**Files:**
- Create: `components/directory/ServiceCard.tsx`
- Create: `components/directory/DirectorySearch.tsx`
- Create: `app/data/place/[place]/page.tsx`, `app/data/theme/[theme]/page.tsx`, `app/data/hub.module.css`

**Interfaces:**
- Consumes: `placeHubs`, `themeHubs`, `getAllServices` (lib/directory.ts); `content/directory/index.json` (static import in the client component).
- Produces: `<ServiceCard service={DirectoryService | IndexEntry} />` — `gh-card` link to `/data/<slug>` with type `.gh-label`, title, provider, one-line description, place/theme chips; `<DirectorySearch />` — client, input + result list of `ServiceCard`-shaped markup (it renders its own markup from index entries; server `ServiceCard` stays server-only), case-insensitive token match over title/provider/place/themes/description, results capped at 20, empty query renders nothing, no-results state is one sentence.

- [ ] **Step 1: Implement `ServiceCard`** (server, mirrors the guides hub card pattern from `app/guides/page.tsx:62-69`).

- [ ] **Step 2: Implement hub pages.** Both follow this skeleton (theme version analogous):

```tsx
// app/data/place/[place]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { placeHubs } from '@/lib/directory';
import { ServiceCard } from '@/components/directory/ServiceCard';
import styles from '../../hub.module.css';

export function generateStaticParams() {
  return placeHubs().map((h) => ({ place: h.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ place: string }> }): Promise<Metadata> {
  const { place } = await params;
  const hub = placeHubs().find((h) => h.slug === place);
  if (!hub) return {};
  return {
    title: `GIS services covering ${hub.label}`,
    description: `${hub.services.length} live mapping services covering ${hub.label}: WMS, ArcGIS REST, and more, each with layers, fields, and connection instructions.`,
    alternates: { canonical: `/data/place/${place}` },
  };
}

export default async function PlaceHub({ params }: { params: Promise<{ place: string }> }) {
  const { place } = await params;
  const hub = placeHubs().find((h) => h.slug === place);
  if (!hub) notFound();
  return (
    <>
      <span className="gh-label gh-eyebrow">Data directory</span>
      <h1>GIS services covering {hub.label}</h1>
      <ul className={styles.grid}>
        {hub.services.map((s) => <li key={s.slug}><ServiceCard service={s} /></li>)}
      </ul>
    </>
  );
}
```

The >= 3 members rule lives in `placeHubs()`/`themeHubs()` (Task 9), so pages need no extra guard. Note: with only the Task 8 seed data, few or no hubs may exist yet — `generateStaticParams` returning `[]` is fine and expected until a real batch lands.

- [ ] **Step 3: Implement `DirectorySearch`**

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import index from '@/content/directory/index.json';
import styles from './directory.module.css';

type Entry = { slug: string; title: string; type: string; provider: string | null;
  place: { country: string; state: string | null } | null; themes: string[]; description: string };

export function DirectorySearch() {
  const [q, setQ] = useState('');
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  const results = tokens.length === 0 ? [] : (index as Entry[]).filter((e) => {
    const hay = [e.title, e.provider, e.place?.country, e.place?.state,
      e.themes.join(' '), e.description, e.type].join(' ').toLowerCase();
    return tokens.every((t) => hay.includes(t));
  }).slice(0, 20);
  return (
    <div className={styles.search}>
      <label className="gh-label" htmlFor="dir-search">Search the directory</label>
      <input id="dir-search" type="search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Try: parcels, flood, WMS, New Zealand" className={styles.searchInput} />
      {tokens.length > 0 && results.length === 0 && (
        <p>Nothing matches that yet. The directory grows with every batch.</p>
      )}
      <ul className={styles.searchResults}>
        {results.map((e) => (
          <li key={e.slug}>
            <Link href={`/data/${e.slug}`} className="gh-card">
              <span className="gh-label">{e.type}</span>
              <strong>{e.title}</strong>
              <span>{e.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Build** — `npm run build` passes; hub routes appear when data allows.

- [ ] **Step 5: Commit**

```bash
git add app/data components/directory
git commit -m "Add hub pages, service cards, and client-side directory search"
```

---

### Task 14: `/data` landing page

**Files:**
- Create: `app/data/page.tsx`, `app/data/data.module.css`

**Interfaces:**
- Consumes: `featured`, `placeHubs`, `themeHubs`, `getAllServices`; `DirectorySearch`; `ServiceCard`; `InstallCta`.
- Produces: the `/data` route: eyebrow label "Data directory", h1 "Live GIS services, documented.", a short lede stating exactly what this is (real copy, plain: services found by Geo Hound users, each verified alive on a stated date, each with layers, fields, and connection instructions — counts rendered from `getAllServices().length`, never hand-written), `DirectorySearch`, "Featured" grid of `featured(6)` `ServiceCard`s, two link lists (places, themes) from the hub derivations, closing `InstallCta` strip explaining pages exist because the extension found the services. Empty state (zero records) renders the lede plus one sentence that the first batch has not landed yet — the build must never break on empty content.
- CollectionPage JSON-LD mirroring `app/guides/page.tsx:19-39`.

- [ ] **Step 1: Implement page + styles** (grid mirrors `hub.module.css` card grid).
- [ ] **Step 2: Build and eyeball both themes** — `npm run build`, `npm run dev`.
- [ ] **Step 3: Commit**

```bash
git add app/data
git commit -m "Add data directory landing page"
```

---

### Task 15: Site wiring — nav, sitemap, OG image, docs

**Files:**
- Modify: `components/SiteHeader.tsx:7-13` (NAV array)
- Modify: `app/sitemap.ts`
- Create: `app/data/opengraph-image.tsx`
- Create: `scripts/build-directory/README.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: `getAllServices`, `placeHubs`, `themeHubs` in the sitemap.

- [ ] **Step 1: NAV** — insert `{ href: '/data', label: 'Data' }` after the `How it works` entry in the `NAV` const in `components/SiteHeader.tsx`. The narrow-screen menu maps the same array; no other change.

- [ ] **Step 2: Sitemap** — in `app/sitemap.ts` add, following the guides pattern at `app/sitemap.ts:38-51`:

```ts
import { getAllServices, placeHubs, themeHubs } from '@/lib/directory';

const data: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/data`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
  ...getAllServices().map((s) => ({
    url: `${SITE_URL}/data/${s.slug}`, lastModified: new Date(s.last_verified),
    changeFrequency: 'monthly' as const, priority: 0.6,
  })),
  ...placeHubs().map((h) => ({
    url: `${SITE_URL}/data/place/${h.slug}`, lastModified: now,
    changeFrequency: 'weekly' as const, priority: 0.7,
  })),
  ...themeHubs().map((h) => ({
    url: `${SITE_URL}/data/theme/${h.slug}`, lastModified: now,
    changeFrequency: 'weekly' as const, priority: 0.7,
  })),
];
```

and spread `...data` into the returned array.

- [ ] **Step 3: OG image** — copy `app/guides/opengraph-image.tsx` to `app/data/opengraph-image.tsx`, retitle to "Data directory" with the same visual conventions (read the guides one first; keep fonts/colours identical).

- [ ] **Step 4: Pipeline README** — `scripts/build-directory/README.md`: the four commands in order, the three env vars, seed mode, the review-the-diff step, and the removal procedure (delete the file, add slug or service_key to `removed.json`, commit). Also state the politeness rules (10 s timeouts, concurrency 6, layer detail cap).

- [ ] **Step 5: AGENTS.md note** — add one line to the repo rules: `content/directory/ is generated by scripts/build-directory/ and committed after review; edit records by re-running the pipeline, not by hand (removals: delete the file and list it in removed.json).`

- [ ] **Step 6: Full build, lint, and commit**

```bash
npm run lint
npm run build
git add components/SiteHeader.tsx app/sitemap.ts app/data/opengraph-image.tsx scripts/build-directory/README.md AGENTS.md
git commit -m "Wire the data directory into nav, sitemap, and OG images"
```

---

### Task 16: Real batch run against Supabase (owner-gated)

**Files:**
- Create (generated): `content/directory/*.json` at scale.

This task needs `SUPABASE_URL` + `SUPABASE_ANON_KEY` (from the extension repo's `config.js`) and ideally `ANTHROPIC_API_KEY`; it is run with the owner present.

- [ ] **Step 1:** `npm run directory:harvest` (no `--seed`); review the printed alive/dead counts.
- [ ] **Step 2:** `npm run directory:enrich` with `ANTHROPIC_API_KEY` set.
- [ ] **Step 3:** `npm run directory:emit && npm run directory:validate`.
- [ ] **Step 4:** Owner reviews `git diff --stat content/directory`, spot-checks ~10 records for wrong place/theme claims and anything that looks like a non-public endpoint, deletes rejects (adding them to `removed.json`).
- [ ] **Step 5:** `npm run build`; check `/data`, one hub, three datasheets in both themes.
- [ ] **Step 6:** Commit the batch: `git add content/directory && git commit -m "Publish first directory batch"`. Deploy via the normal Vercel flow.

---

## Self-review notes

- **Spec coverage:** pipeline stages (Tasks 3-8, 16), review gate (8/16), datasheet sections 1-7 (Tasks 10-12), hubs + >= 3 rule (9, 13), search (13), landing (14), sitemap/nav/OG (15), takedown path (11 footer + 15 README), slug stability and removed.json (6), empty-state safety (7, 13, 14), no runtime Supabase (all site tasks read files only). Phase-2 share flow intentionally absent (spec: out of scope).
- **Type consistency:** `ProbeResult` fields match `buildRecord` consumption; `meaning` shape produced by Task 5 matches Task 6 input; `DirectoryService` (Task 9) mirrors the emit schema; `Hub` consumed by Tasks 13-15. `validateRecord` is shared by emit (Task 6) and validate (Task 7).
- **Known risk accepted:** seed URLs in Task 8 may be dead by run time; the pipeline drops them by design, and the site tolerates any record count including zero.
