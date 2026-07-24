import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { selectCandidates, seedRow } from './lib/harvest-core.mjs';
import { probeService } from './lib/probe.mjs';

const TARGET = Number(process.env.DIRECTORY_TARGET ?? 750);
const seedIdx = process.argv.indexOf('--seed');

/* The production table is 1.1M+ rows with no useful indexes for the anon
   role: any ORDER BY or sparse filter exceeds the statement timeout. Dense
   unordered filters return quickly because the planner stops at the limit,
   so harvest pulls several dense slices (authoritative domains, major
   service types) and ranks client-side. If migrations/004 (pg_trgm) and a
   b-tree on discovery_count are ever applied, this can become a single
   ordered query again. */
const URL_PATTERNS = ['*.govt.nz*', '*.gov.au*', '*.gov.uk*', '*.gc.ca*', '*.gov/*'];
const SERVICE_TYPES = ['ESRI MapServer', 'ESRI FeatureServer', 'ESRI ImageServer', 'OGC WMS', 'OGC WFS'];
const COLS = 'normalized_url,service_type,service_title,service_abstract,provider_name,layer_names,bounding_box,cors_enabled,last_verified,discovery_count';
const SLICE_LIMIT = 1000;

async function fetchSlice(base, headers, filter, label) {
  // Transient failures happen (truncated bodies, occasional 500s), so each
  // slice gets three attempts before it is skipped.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(
        `${base}/rest/v1/global_service_directory?select=${COLS}&${filter}&limit=${SLICE_LIMIT}`,
        { headers, signal: AbortSignal.timeout(30_000) },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      console.log(`slice ${label}: ${rows.length} rows`);
      return rows;
    } catch (err) {
      if (attempt === 3) {
        console.warn(`slice ${label}: ${err.message ?? err.name}, skipped after 3 attempts`);
        return [];
      }
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  return [];
}

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
  const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };
  const rows = [];
  for (const pattern of URL_PATTERNS) {
    rows.push(...await fetchSlice(SUPABASE_URL, headers, `normalized_url=ilike.${encodeURIComponent(pattern)}`, pattern));
  }
  for (const type of SERVICE_TYPES) {
    rows.push(...await fetchSlice(SUPABASE_URL, headers, `service_type=eq.${encodeURIComponent(type)}`, type));
  }
  if (rows.length === 0) { console.error('No rows fetched from any slice.'); process.exit(1); }
  return rows;
}

const rows = await loadRows();
const candidates = selectCandidates(rows, TARGET);
console.log(`rows: ${rows.length}, candidates after ranking: ${candidates.length}`);

/* probeService carries its own per-request timeouts, but a rare hung socket
   can still leave a promise unsettled forever, which kills the whole run
   (Node exits on an unsettled top-level await). The race guarantees every
   probe settles. */
const PROBE_DEADLINE_MS = 45_000;
const DEAD = { alive: false, response_ms: null, title: null, abstract: null,
  layers: [], formats: [], crs: [], bbox: null };

function probeWithDeadline(raw) {
  let timer;
  const deadline = new Promise((resolve) => {
    timer = setTimeout(() => resolve(DEAD), PROBE_DEADLINE_MS);
  });
  return Promise.race([
    probeService({ url: raw.normalized_url, type: raw.service_type }, fetch),
    deadline,
  ]).finally(() => clearTimeout(timer));
}

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < candidates.length) {
    const raw = candidates[cursor++];
    const probe = await probeWithDeadline(raw);
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
console.log('wrote .work/harvest.json');
