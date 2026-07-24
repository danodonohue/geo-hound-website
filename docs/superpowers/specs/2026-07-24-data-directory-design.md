# Geo Hound data directory — design

Date: 2026-07-24
Status: approved (architecture and section 1 approved explicitly; sections 2-3
approved at architecture level via "looks good lets build it")

## Purpose

Turn the crowdsourced `global_service_directory` Supabase table (built
automatically by the Geo Hound extension) into a public, curated, statically
generated directory of live GIS services on geohound.app. Each service gets a
"datasheet" page. The directory is the site's SEO and sharing substrate: pages
are the future landing target for the extension's phase-2 "Share this" flow,
and browse hubs target "GIS data for <place>/<theme>" queries.

Explicitly out of scope for v1 (phase 2 and later, own specs):

- Extension "Share this" button. Phase 2 design intent, recorded here: sharing
  a service not in the curated set prompts the sharer to answer a few questions
  ("what is this about?"), and the answers power an on-the-fly page (dynamic
  route, noindex). Human answers double as enrichment.
- Web workbench (upload your own data + chat on the website). Separate project.
- Page-per-layer URLs. Layers are anchored sections on the service page in v1.
- Any runtime Supabase dependency, accounts, or new edge functions.

## Decisions made during brainstorming

1. Publish a quality-filtered curated subset, not the whole table. A page
   exists because a reviewed data file is committed to this repo.
2. Enrichment is an offline batch run on the owner's machine, not production
   infrastructure. Haiku (Anthropic API) + heuristics; output reviewed in git.
3. Batch size target: best 500-1,000 candidates.
4. V1 ships: service pages, place/theme hubs, client-side search, live map
   previews (click-to-activate). No extension changes.
5. Maps: Leaflet, matching the extension. Default visual is an inline SVG
   extent map (bbox over world outline, graticule ticks) — no build-time
   screenshots, no third-party tile loads until the user opts in.
6. Hubs only include services with confident place/theme tags; low-confidence
   services still get their own page (graceful degradation, never a wrong
   claim).
7. Every page carries a "Report an issue with this listing" mailto (takedown
   path) and the install CTA.

## Architecture

```
Supabase (global_service_directory, read-only)
        |
        v
scripts/build-directory/   (Node, run manually; three stages)
  1 harvest  -> candidates ranked by discovery_count, metadata richness,
                recency; live probe: liveness, capabilities / ?f=json
                (layer trees, field schemas, counts), response time
  2 enrich   -> heuristics (bbox sanity + country/state intersection,
                domain rules e.g. .govt.nz, capabilities contact blocks)
                then Haiku for theme/place/description where unsure;
                confidence recorded; "unknown" is a valid output
  3 emit     -> content/directory/<slug>.json (one per service)
                content/directory/index.json (compact search index)
        |
   git diff review by owner, deletions welcome, commit
        |
        v
Next.js static build (generateStaticParams over content/directory/)
  /data                      landing: search + featured + hub links
  /data/<slug>               service datasheet page
  /data/place/<place-slug>   hub (confident places only)
  /data/theme/<theme-slug>   hub (confident themes only)
  app/sitemap.ts extended; per-page OG images via existing dynamic OG pattern
```

No new runtime infrastructure. The site keeps exactly one API route (contact).

## Data file schema (per service)

```jsonc
{
  "slug": "environment-canterbury-flood-hazard-mapserver", // authoritative, never regenerated
  "service_key": "ESRI MapServer:https://...",  // extension dedup key, for phase-2 share resolution
  "type": "ESRI MapServer",                     // detectServiceType vocabulary
  "url": "https://...",
  "title": "...",
  "description": "...",        // enriched one-liner
  "abstract": "...",           // original service abstract, if any
  "provider": "...",
  "place": { "country": "New Zealand", "state": "Canterbury", "confidence": "high|medium|low" },
  "themes": [{ "name": "flood-hazard", "confidence": "high" }],
  "bbox": [minx, miny, maxx, maxy],             // WGS84, null if unknown/world-spanning
  "layers": [{ "id": 0, "name": "...", "title": "...", "geometry": "polygon",
               "fields": [{ "name": "...", "type": "...", "alias": "..." }],
               "feature_count": 1234 }],
  "formats": ["..."], "crs": ["EPSG:4326"],
  "cors_enabled": true, "response_ms": 340,
  "last_verified": "2026-07-24", "discovery_count": 7,
  "quality_score": 0.8,
  "enrichment": { "model": "claude-haiku-4-5-20251001", "date": "2026-07-24", "notes": "" }
}
```

`index.json` per record: slug, title, type, provider, place, themes,
description — kept under ~300 KB for 1,000 records; loaded by the client-side
search component only on /data pages.

## Service page (datasheet) — approved layout

1. Header: title, provider, service-type badge (.gh-label), place/theme tags
   (high confidence only).
2. Map block: inline SVG extent map by default (bbox over minimal world/region
   outline, graticule ticks — design-brief cartographic garnish). "Load live
   preview" button swaps in Leaflet: WMS/XYZ/ESRI-tiled always allowed (image
   loads are not CORS-bound); FeatureServer/WFS vector preview only when
   cors_enabled, capped ~500 features; otherwise button absent with a one-line
   reason. No bbox -> extent map replaced by a labelled placeholder.
3. Facts panel: endpoint URL (mono + copy button), type, layer count, formats,
   CRS list, CORS status, response time, last verified, times discovered.
4. Layers: anchored table (name, title, geometry, field count) with expandable
   field schema per layer.
5. Connect snippets: copy-paste blocks for QGIS, ArcGIS Pro, Leaflet, Python —
   generated from url + type. Primary organic-search asset.
6. Cross-links: same provider / same place / same theme, up to 5 each.
7. Footer strip: InstallCta ("Discovered with Geo Hound") + "Report an issue
   with this listing" mailto to CONTACT_EMAIL with slug in subject.

## Hubs and search

- Hub page = intro line + list of service cards (title, type badge, provider,
  description, place/theme chips), grouped alphabetically or by sub-place when
  a country hub exceeds ~30 entries. Hubs exist only where >= 3 confident
  member services (avoid thin hubs). Hub slugs kebab-case, namespaced under
  /data/place/ and /data/theme/ so they can never collide with service slugs.
- /data landing: search box, ~6 featured services (highest quality_score),
  hub link lists.
- Search: client component ('use client') fetching index.json on mount;
  substring + simple token match over title/provider/place/themes/description;
  no backend. Renders same service cards.

## Design constraints (site hard rules, restated as applied here)

- tokens.css consumed, never edited; borders not shadows; sentence-case
  headings; .gh-label for badges; mono for URLs/coordinates; no emoji — inline
  SVG icons in components/icons/ only.
- Identity/numbers from lib/constants.ts (CONTACT_EMAIL, INSTALL_CTA_LABEL,
  IS_STORE_LIVE etc.). No prices appear here.
- Copy plain and specific; no popularity claims about the directory beyond
  verifiable counts (e.g. "discovered N times" comes from real data).

## Edge handling

- Dead service at harvest time: excluded from emit (flagged in script output).
- Missing/world-spanning bbox: bbox null; no place hub membership from bbox;
  extent map placeholder; page still published if quality passes.
- Capabilities fetch fails but service alive: publish with directory metadata
  only; layers section shows what is known.
- Huge services (40+ layers): layer table paginated/collapsed after 15 rows;
  field schemas lazy-expanded.
- Slug collision at emit: script appends provider/type disambiguator and
  reports; existing slugs in content/directory/ are never rewritten
  (regeneration preserves published URLs).
- Removal: deleting a JSON file (or a takedown) removes the page at next
  build; script never resurrects a slug listed in
  content/directory/removed.json.

## Testing

- Script: node --test co-located tests (mirrors extension convention) for
  ranking, heuristics (bbox/domain/place inference), slug generation and
  stability, emit schema validation. Live probes mocked.
- Site: next build over the committed content is the integration gate (all
  pages must build); a small script-level validator checks every JSON against
  the schema and every cross-link/hub reference resolves. Manual visual pass
  on both themes.

## Dependencies and prerequisites to run the batch

- Supabase read access to global_service_directory (extension's public anon
  key suffices for reads; key lives in the extension repo config.js — script
  takes SUPABASE_URL/SUPABASE_ANON_KEY via env).
- ANTHROPIC_API_KEY in env for the Haiku enrichment stage (stage is skippable;
  heuristics-only output is valid but yields fewer hub tags).
- Leaflet added to the website package.json (first mapping dependency).
