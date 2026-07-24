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
