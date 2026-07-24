import { placeFromDomain, THEMES } from './heuristics.mjs';

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
      // The domain rule wins; accept the LLM state only when countries agree.
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
