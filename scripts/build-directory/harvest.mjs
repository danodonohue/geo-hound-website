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
console.log('wrote .work/harvest.json');
