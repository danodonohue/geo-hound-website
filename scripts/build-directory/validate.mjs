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
