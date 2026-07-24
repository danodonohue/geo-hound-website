<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Geo Hound website

Companion site for the Geo Hound Chrome extension. Next.js App Router, static
first, deployed on Vercel. `DESIGN-BRIEF.md` is the master brief and outranks
anything here. `COMPLIANCE-CHROME-WEB-STORE.md` governs /privacy and /terms.

## Hard rules

1. **No emoji or dingbat characters.** Anywhere: copy, source, comments, commit
   messages. The product has a no-emoji policy after encoding incidents. Use the
   inline SVG icons in `components/icons/` instead. This is not a style
   preference, it is a project rule.
2. **`styles/tokens.css` is byte-identical to the extension's export.** Never
   edit it. It is the source of truth for colour, type, and shape. Consume the
   variables; do not redefine them. The single exception is the font wiring at
   the top of `app/globals.css`, which points `--gh-font` and `--gh-mono` at the
   next/font self-hosted faces, and is documented in place.
3. **Numbers and identity live in `lib/constants.ts`.** Prices, quotas, contact
   email, seller name, store URL. If a value appears on a page, it is read from
   there. Never hard-code a price into a component, a string of copy, or an
   image. Prices are expected to rise after launch.
4. **Structure comes from borders, not shadows.** 1.5px hairlines and 2px ink
   borders, near-square corners, flat surfaces.
5. **Uppercase is reserved for the micro-label idiom** (`.gh-label`) and
   buttons. Headings are sentence case.
6. **Copy is plain and specific.** Name real things: QGIS, ArcGIS Pro, WMS,
   FeatureServer. Numbers over adjectives. No startup hype. Claims must be
   substantiable: the extension is unpublished, so no popularity or testimonial
   claims of any kind.
7. **`content/directory/` is generated, not authored.** It is produced by
   `scripts/build-directory/` and committed after human review; edit records by
   re-running the pipeline, never by hand. Removals: delete the file and list
   its slug or service_key in `content/directory/removed.json`.

## Product facts, verified against the extension source

Do not restate these from memory. They were read out of the extension repo on
2026-07-17 and are encoded in `lib/constants.ts`:

- 26 assistant tools (`lib/chat-tool-defs.js`).
- Extension v1.9 (`manifest.json`).
- The assistant relays through a Supabase edge function to **OpenRouter**, which
  routes on to third-party model providers. The model is env-configurable
  (`CHAT_MODEL`), so the site names the gateway, not the model.
- Free quota is 10 questions/month, 1 credit per question.

## Pending before launch

- `SELLER_NAME` is a placeholder and renders visibly broken on purpose. /terms
  and the footer imprint cannot ship until the owner confirms the legal entity.
- `CHROME_STORE_URL` is null; every install CTA renders its coming-soon state
  until it is set, then all CTAs flip with no other edit.
- `GA_MEASUREMENT_ID` is null; no analytics or consent banner is injected while
  it is.
- `CONTACT_EMAIL` is the working candidate, not yet confirmed.
