# Directory build pipeline

Turns Supabase `global_service_directory` rows into reviewed JSON records in
`content/directory/`, which the site renders statically under `/data`. Nothing
here runs in production; every publish is a local run followed by a git review.

## Environment

| Variable | Needed by | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | harvest | Extension project URL (see extension repo `config.js`) |
| `SUPABASE_ANON_KEY` | harvest | Public anon key; reads only |
| `ANTHROPIC_API_KEY` | enrich | Optional. Without it the enrich stage is heuristics-only, which means fewer place and theme tags |
| `DIRECTORY_TARGET` | harvest | Optional, default 750: max records kept per batch |

## Run order

```
npm run directory:harvest        # Supabase pull + live probe -> .work/harvest.json
npm run directory:enrich         # heuristics + optional Haiku -> .work/enriched.json
npm run directory:emit           # quality gate + slugs -> content/directory/
npm run directory:validate       # schema and cross-reference checks
```

Bootstrap/seed mode (no Supabase needed; note: call node directly, npm eats
the flag):

```
node scripts/build-directory/harvest.mjs --seed scripts/build-directory/seed-candidates.json
```

## After a run

1. `git diff --stat content/directory` and spot-check records: wrong place or
   theme claims, endpoints that look internal or non-public, junk titles.
2. Delete any record that should not ship and add its `slug` or `service_key`
   to `content/directory/removed.json` so no future batch resurrects it.
3. Commit. The site build (`npm run build`) refuses to run if validation fails.

Slugs are stable: a record whose `service_key` already exists keeps its slug
across batches, so published URLs never change. A batch refreshes and adds
records; it never deletes. Removal is always the manual step above.

## Politeness rules

Requests time out after 10 s; probing runs at most 6 services concurrently;
per-layer detail is fetched for at most the first 15 layers; feature counts
are only requested from FeatureServers. Keep it that way — these are other
people's servers.

## Tests

```
npm run directory:test
```

Co-located `*.test.mjs` files under `lib/`, run with `node --test`. The stages
are thin CLIs over pure, tested modules; network access is injected so tests
never touch the network.
