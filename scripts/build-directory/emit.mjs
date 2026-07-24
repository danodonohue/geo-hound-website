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
