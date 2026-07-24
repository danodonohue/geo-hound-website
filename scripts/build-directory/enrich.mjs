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
      meaning.enrichedBy = MODEL;
    }
    out[i] = { ...entry, meaning };
    process.stdout.write('.');
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(`\nenriched ${out.length} records (${llmCalls} model calls)`);
await writeFile(new URL('./.work/enriched.json', import.meta.url), JSON.stringify(out, null, 2));
