# Geo Hound Website - Design and Build Brief

Brief for an AI designer/developer. You are building the official companion
website for **Geo Hound**, a Chrome extension for finding, saving, and
analysing GIS data. Read this whole document before designing anything.

Companion files in this folder:

- `assets/tokens.css` - the extension's exact design tokens (light + dark). Use verbatim.
- `SCREENSHOTS.md` - which product screenshots exist, which are still needed, and capture specs.
- `COMPLIANCE-CHROME-WEB-STORE.md` - the legal/policy pages the site MUST host and what they must contain.

---

## 1. What you are delivering

1. **First pass: mockups.** Landing page plus one interior page (docs page and
   pricing page preferred) in both light and dark themes, for owner approval
   BEFORE building the full site.
2. **Second pass: the working website.** Next.js (App Router), deployed on
   Vercel. Static-first: no database, no auth, no server rendering needs
   beyond what Next gives for free. A contact form may POST to a simple
   form-handling endpoint (Vercel serverless function or a service like
   Formspree) - keep it minimal.

Constraints:

- Content (pricing numbers, FAQ answers, feature lists) must live in easily
  editable places (MDX / a constants file), because prices are expected to
  change after launch.
- Both light and dark theme, honouring `prefers-color-scheme` with a manual
  toggle persisted to localStorage - exactly like the extension does.
- **Absolutely no emoji or dingbat characters anywhere in source or copy.**
  This is a hard project rule (the product has a no-emoji policy after
  encoding incidents). Use inline SVG line icons instead - Phosphor-style,
  24px grid, stroke = currentColor, matching the extension's icon language.
- Fonts: Be Vietnam Pro (UI/headings/body) and JetBrains Mono (code, URLs,
  data). Vendor them via `next/font` - do not hotlink Google Fonts at runtime.
- Accessible: semantic HTML, visible focus states (the extension uses a
  2px green/lime focus ring), WCAG AA contrast in both themes.
- Fast: this is a mostly-static marketing/docs site. Aim for Lighthouse 95+.

Placeholders to leave in the code as obvious single-point-of-change constants:

- `SITE_DOMAIN` - final domain not yet chosen by the owner.
- `CONTACT_EMAIL` - owner will confirm (geohound@mapscaping.com is the working candidate).
- `CHROME_STORE_URL` - extension not yet published; every install CTA reads
  "Coming soon to the Chrome Web Store" until this constant is set, then all
  CTAs flip to the real link with no other edits.

---

## 2. The product (what Geo Hound actually is)

Geo Hound is a Manifest V3 Chrome extension (currently v1.9). It has three
layers, and the website should present them in this order - it mirrors both
the user journey and the story:

### Layer 1 - The Detector (free)

As you browse any website, Geo Hound watches network traffic and page content
and automatically detects geospatial services and files, so you never have to
open DevTools and dig through network requests to find the URL feeding a web
map.

- Detects OGC services: WMS, WFS, WMTS, WCS, and modern OGC API (Features, Tiles, ...).
- Detects Esri/ArcGIS REST services: MapServer, FeatureServer, ImageServer,
  GPServer, GeometryServer, GeocodeServer, VectorTileServer.
- Detects tile endpoints: XYZ tiles, vector tiles, vector tile styles.
- Detects geospatial file links on pages: KML, KMZ, GeoJSON, Shapefile,
  GeoPackage, GML, MBTiles, FlatGeobuf, GeoTIFF.
- Badge count on the toolbar icon as things are found.
- Everything is saved locally with metadata (title, provider, description,
  layers, keywords, CRS, bounding box), organisable into folders, searchable.
- Per-service extras: CORS test (will this service load in a browser app?),
  URLs pre-formatted for QGIS and ArcGIS Pro, copy-all, JSON export,
  file downloads with an area-of-interest map selector.

### Layer 2 - The Workbench (free)

A full-page GIS workspace inside the extension. Saved services become live
map layers; no desktop GIS required.

- Add detected services or import local files (GeoJSON, KML/KMZ, GPX,
  Shapefile, GeoPackage...); basemap switcher; legend; labels.
- Attribute table with a real AND/OR filter builder, column stats, CSV export.
- Selection that works across layers: click, box, polygon; select by
  attribute; select by location.
- Analysis tools: buffer, spatial join, nearest-distance, overlay operations,
  field calculator, save-selection-as-layer - result layers chain into
  further analysis.
- Symbology: colour pickers, symbolize-by-attribute (categories), labels,
  identify with an overlap chooser, map legend.
- Annotations: draw points, lines, polygons with labels and colours.
- Export: GeoJSON, KML, Shapefile, XLSX, CSV; PNG map export; a generated
  PDF map report. Sessions auto-save and restore.

### Layer 3 - The Assistant (paid; THE headline feature)

A chat assistant inside the Workbench. You type what you want in plain
English; it drives the GIS for you using 26 tools. This is the big selling
point and the thing the website must make people *get* within seconds.

The pitch: **GIS analysis for people who do not know GIS software.** You do
not need to know what a spatial join is - you just ask the question.

Real examples of what you can type (use these or close variants on the site;
they demonstrate breadth):

- "Don't like the colour of a layer? Say: make the flood zones orange and label them by name."
- "Buffer the wells by 500 metres and tell me how many parcels fall inside."
- "Which suburb has the most building consents?"
- "Join the soil types onto my imported paddock boundaries."
- "How far is each school from the nearest fire station?"
- "Select everything inside this polygon and export it as a shapefile."
- "Add a satellite basemap and zoom to my selection."

Under the hood (for the docs page, not the hero): the assistant can list and
search layers, read schemas, page full datasets, query and filter, compute
statistics, buffer, select by location, spatial join, nearest distance,
transform/explode, overlay layers, calculate fields, convert annotations and
selections to layers, add/remove/show/hide layers, zoom, symbolize, style,
label, switch basemaps, drop markers, and export data.

Privacy-relevant fact for copy: the assistant sends only layer schemas,
counts, and small capped samples to the model - raw datasets never leave the
browser wholesale. Conversations are not stored server-side.

### Pricing (current, live)

- Extension: **free to install**; Detector and Workbench fully free.
- Assistant: **10 free questions per month** for everyone.
- Then one-time credit packs (via Stripe): **$10 for 250 questions, $20 for
  550, $40 for 1,200**. 1 credit = 1 question you send; the assistant's own
  follow-up tool steps are free. **Purchased credits never expire.** No
  subscription.
- Restore across devices/reinstalls: enter your purchase email, get a 6-digit
  code, balance moves to the new install.
- Owner note: prices will likely rise later - keep them as data, not baked
  into imagery.

---

## 3. Audience and use cases

Two audiences, one funnel:

**A. GIS professionals and technicians** (analysts, consultants, surveyors,
local-government officers, researchers). Pain: they see data on a public web
map and need it in QGIS/ArcGIS Pro. Today that means DevTools > Network tab >
scrolling through requests hoping to spot the service URL. Geo Hound catches
it automatically. For them, the Detector is the hook; the Workbench is a
bonus; the Assistant is a fast-answers convenience.

**B. Map-curious non-GIS people** (journalists, planners, real-estate and
environmental folks, farmers, hunters, hobbyists - anyone who uses
government/public web maps). Pain: the data they are staring at cannot answer
their question, and desktop GIS is a cliff. For them the Assistant IS the
product: analysis in plain English, right where the data already is.

Concrete use-case vignettes worth illustrating (pick 3-4 for the landing page):

- A council GIS officer finds the parcels FeatureServer behind a public
  viewer and has it in QGIS in one click.
- A journalist asks "which district has the most consented wells?" on a
  regional council map and gets a number plus a shaded map.
- An environmental consultant buffers streams by 20 m and overlays a client's
  property boundary they imported as KML.
- A farmer imports paddock GPX, joins public soil data onto it, exports XLSX.

---

## 4. Story / About (raw material - polish it, keep it honest)

The founder is a GIS specialist and runs **MapScaping** - the MapScaping
Podcast is a well-known geospatial industry podcast. Geo Hound is a
MapScaping product, and the site should say so (credibility + audience).

Origin, in the founder's own framing:

> Finding the data behind a public web map was a pain even for me, a GIS
> professional: open developer tools, watch the network requests, scroll,
> guess, copy, clean up the URL, hope it works. I built Geo Hound to make
> that automatic - browse the map, and the services are just... caught,
> saved, and formatted for QGIS or ArcGIS Pro.
>
> Then the idea grew. Instead of only helping GIS people take data back to
> their software, why not bring the GIS to where people already are? Most
> people looking at a public web map will never install QGIS. So we built a
> workbench into the browser, and then put an assistant on top of it - so
> anyone can ask a map a question in plain English, on any public web map's
> data, and do their own analysis right there.

Arc for the About page: "help GIS people grab data" evolved into "give everyone
their own GIS analyst in the browser". Tone: practical, first-person,
tradesman-like. No startup hype, no "revolutionise".

---

## 5. Site map and per-page requirements

```
/                     Landing
/how-it-works         Detailed instructions (docs hub)
  /docs/detector        Finding and saving GIS services
  /docs/workbench       Using the workbench (import, table, selection, analysis, symbology, annotations, export)
  /docs/assistant       Using the assistant (with a prompt cookbook)
  /docs/faq             FAQ
/pricing              Pricing
/services             Custom work (dedicated page - important to owner)
/about                Story + MapScaping connection
/support              Contact + help (required by Chrome Web Store listing)
/privacy              Privacy policy (REQUIRED - the Chrome Web Store listing links here)
/terms                Terms of service incl. refund policy for credit packs
/changelog            Optional, low priority
```

### Landing (/)

Sections, in order:

1. **Hero.** One-line promise + product screenshot (workbench with map,
   light theme on cream). Working headline direction (improve on it):
   "The GIS data behind any web map. Found, saved, and ready to analyse."
   Sub: "Geo Hound detects the map services on any page as you browse - then
   lets you map, query, and analyse them right in your browser. No DevTools.
   No desktop GIS required." CTA: Chrome Web Store button (Coming-soon state
   until launch) + secondary "See how it works".
2. **The pain, in one image.** DevTools network-tab chaos vs the Geo Hound
   popup showing a clean list of found services. This before/after is the
   fastest way to make GIS people feel seen.
3. **Three layers.** Detector -> Workbench -> Assistant as three blocks,
   each with a screenshot, ordered as the user journey.
4. **Assistant spotlight.** The headline feature gets its own full-width
   section: a mock chat exchange (real prompt examples from section 2),
   ideally showing the map changing in response. "Don't like a colour?
   Tell it. Need a number? Ask it."
5. **Use-case vignettes.** 3-4 from section 3, as cards ("For GIS pros",
   "For journalists", "For consultants", "For landowners").
6. **Service-type wall.** The formats/services grid (WMS, WFS, WMTS, WCS,
   OGC API, ArcGIS MapServer/FeatureServer/..., XYZ, vector tiles, KML,
   GeoJSON, Shapefile, GeoPackage, GeoTIFF...) - set in JetBrains Mono;
   this is catnip for the technical audience and great for SEO.
7. **Pricing teaser.** "Free to install. Detector and Workbench free
   forever. Assistant: 10 free questions a month, then pay once for credits
   that never expire." Link to /pricing.
8. **MapScaping strip.** "From the maker of the MapScaping Podcast" +
   link to /about and mapscaping.com.
9. **Footer.** Nav, legal links, contact email, "Custom work" link to
   /services.

### /how-it-works and /docs/*

Real documentation, not marketing. Numbered steps with a screenshot per
step (see SCREENSHOTS.md for the shot list). Structure per page:

- **Detector:** install; browse to any web-map site; badge count appears;
  open popup; what a service card shows (metadata, CORS badge); folders and
  search; disabled-URL patterns to silence noisy sites; copy for QGIS
  (exact clicks) and ArcGIS Pro; export JSON; downloading file links with
  the AOI selector.
- **Workbench:** opening it; adding a saved service as a layer; importing
  local files; the layer cards (visibility, style, zoom-to); attribute
  table + filter builder; selection tools; each analysis tool as a short
  recipe (buffer, select-by-location, spatial join, nearest, overlay,
  field calculator); symbology and labels; annotations; exports and the
  PDF report; sessions.
- **Assistant:** where it lives (Assistant tab); free quota and the
  questions-left pill; a "prompt cookbook" of 15-20 categorized example
  prompts (styling, querying, stats, analysis chains, import/export);
  what data leaves the browser (schemas/counts/samples only); buying
  credits; restoring credits on a new machine.
- **FAQ seeds:** Does it slow browsing down? Does it work on private/
  logged-in maps? (it detects what your browser loads; respect data owners'
  terms) - Why does it need "read data on all websites"? (that is how
  detection works; nothing is sold, see privacy) - Where is my data stored?
  - What happens when I hit 500 saved services? - Do credits expire? (no)
  - Refunds? - Does it work in Edge/Brave? - Is my analysis private?

### /pricing

Three-tier layout but honest framing: "Free" (Detector + Workbench,
everything listed), "Assistant free tier" (10 questions/month), "Credit
packs" (the three packs as cards; $20/550 visually featured). Below: how
credits work (1 question = 1 credit, tool steps free, never expire, restore
by email code), payment via Stripe, refund note linking /terms. All numbers
from a single constants file. A short FAQ block repeats the credit
questions. No "per month" language anywhere near the packs - "pay once" is
the differentiator.

### /services (dedicated page - owner priority)

Pitch: the same team that built Geo Hound takes custom work.

- "Want this on YOUR web map?" - custom chat interfaces for an
  organisation's own web maps/portals (talk-to-your-map for your users).
- Custom GIS tools, data pipelines, web-map development.
- Consulting on making your public map data usable (services, CORS, formats).
- Process: short discovery call -> fixed-price proposal.
- CTA: contact form + email. Keep it one page, confident, concrete.

### /about

Story from section 4, founder credentials (GIS specialist, MapScaping
Podcast), photo optional, links to mapscaping.com and the podcast. Ends
with both CTAs: install + services.

### /support

Contact email (CONTACT_EMAIL constant), links into docs/FAQ, response
expectation ("within 2 business days"), plus the credit-restore walkthrough
(most likely support topic). This page's URL doubles as the Chrome Web
Store "support" link.

### /privacy and /terms (compliance pages - REQUIRED, non-negotiable)

Full requirements with citations are in COMPLIANCE-CHROME-WEB-STORE.md;
the load-bearing points are repeated here because the site cannot ship
without them:

- **/privacy** must disclose: what browsing activity the extension inspects
  and why; what stays local vs syncs to Supabase; the Assistant data flow
  (chat messages + layer schemas/counts/small samples go to our proxy and
  the named LLM provider; conversations not stored server-side); Stripe as
  payment processor; every third party (Supabase, Stripe, LLM provider,
  Resend); retention and encryption; a promise to prominently disclose any
  future change in data practices. It MUST contain the Limited Use
  affirmative statement verbatim in spirit: "Geo Hound's use of information
  received from Chrome APIs adheres to the Chrome Web Store User Data
  Policy, including the Limited Use requirements." The URL must be stable
  forever once submitted to the store. Include a "last updated" date.
- **/terms** (Terms of Service + Terms of Sale) must cover: what a credit
  is (1 credit = 1 question; the assistant's tool steps are free); packs
  are one-time purchases via Stripe; credits never expire; the refund
  policy (full refunds only; a refund claws back the credited balance);
  the email-code credit-restore mechanism; the seller's legal identity
  (the MapScaping business entity - constant, owner to confirm exact
  name); and an explicit "the developer, not Google, is the seller"
  statement. Include a "last updated" date.
- **Footer imprint block, site-wide.** EU DSA trader rules mean the
  owner's verified business name and contact details are published on the
  store listing; the site footer carries a small matching imprint (business
  name + contact email) so site and listing identities agree. Build it
  from constants.
- Design both legal pages as readable single-column documents in the same
  visual system - a branded header strip over calm, plain text. No
  marketing furniture.
- New Chrome Web Store policies are ENFORCED from August 1, 2026 - the
  copy baseline throughout the site is the new policy wave, not the old
  rules (see COMPLIANCE-CHROME-WEB-STORE.md section 5 for the copy
  constraints: single-purpose framing, honest permissions story, plain
  free/paid split, no fake testimonials).

---

## 6. Look and feel - "Layered Paper"

The site must read as the same object as the extension. Use
`assets/tokens.css` verbatim. The aesthetic in words:

- **Warm cartographic paper, not white SaaS.** Light theme: cream paper
  `#f6f1e4`, near-black-green ink `#16240f`. Think field notebook /
  topographic-map sheet, not dashboard.
- **Border-led, flat.** Structure comes from 1.5-2px solid ink borders and
  hairlines, not drop shadows. Corners near-square (2px radius; 4-6px max).
- **Uppercase micro-labels.** Small bold uppercase letter-spaced labels
  (10-11px, tracking 0.05-0.1em) as eyebrows, buttons, and section markers -
  like map marginalia.
- **Cartographic garnish, used sparingly.** The extension frames its map
  with corner registration marks. The site may use: corner ticks on
  screenshots/cards, faint graticule/grid lines on section backgrounds,
  scale-bar or north-arrow motifs as dividers, coordinate-style captions
  set in JetBrains Mono (e.g. "FIG 02 / WORKBENCH - 41.29 S, 174.78 E").
  Do not turn it into a theme park; two or three of these motifs, used
  consistently, is right.
- **Dark theme = night survey instrument.** Near-black green `#1b1f15`,
  paper-cream text, lime accent `#9ee83f`/`#80cc28`. Filled buttons flip
  from ink-on-paper to lime-on-black.
- **Accent discipline.** Brand green `#4c9f1a` (light) / lime (dark) for
  primary actions and highlights only. The semantic colours (purple =
  analysis/result, orange = selection, blue = raster/info) may echo in
  diagrams and docs callouts.
- **Type scale.** Headings and body in Be Vietnam Pro; headings heavy
  (700-800) but modest in size - editorial, not billboard. Everything
  data-ish (URLs, service types, coordinates, code, keyboard keys) in
  JetBrains Mono. Marketing pages can scale the system up (hero ~44-64px)
  while keeping the same voice.
- **Buttons.** Rectangular, uppercase, letter-spaced; outline by default,
  filled ink (light)/lime (dark) for primary. Exactly like `.gh-btn` /
  `.gh-btn--primary` in the extension.
- **Icons.** Hand-drawn-feel line icons, 24px grid, currentColor strokes
  (Phosphor style). NO emoji, ever.
- **Motion.** Minimal and mechanical: 150ms color/background transitions,
  maybe a subtle detector "ping" animation in the hero. No parallax, no
  scroll-jacking.

Screenshots are the primary imagery. Present them as "plates" in a survey
document: 2px ink border, corner ticks, mono caption underneath. Alternate
light-theme and dark-theme shots deliberately (never mix themes within one
section).

---

## 7. Voice and copy rules

- Plain, confident, specific. Written by a GIS tradesperson, not a growth
  team. "It watches the network requests so you don't have to" beats
  "AI-powered geospatial intelligence platform".
- Name real things: QGIS, ArcGIS Pro, WMS, FeatureServer. The technical
  audience trusts specificity; the non-technical audience skims past it.
- Numbers over adjectives: "10 free questions a month", "26 tools",
  "detects 20+ service and file types".
- Honest about limits: works with public services the page can already
  reach; respect data providers' terms of use.
- No emoji. No exclamation-mark pileups. Sentence case for headings
  (uppercase is reserved for the micro-label idiom).

---

## 8. SEO basics (bake in, don't obsess)

- Target queries: "find WMS URL behind web map", "get data from ArcGIS web
  map", "extract GIS data from website", "browser GIS analysis", "web map
  data extractor Chrome extension", "talk to a map / AI GIS assistant".
- One h1 per page, descriptive titles/metas, OpenGraph images in the
  Layered Paper style, JSON-LD (SoftwareApplication on /, FAQPage on the
  FAQ, HowTo on docs pages).
- Docs pages are the long-tail engine - each service type mentioned on the
  landing "wall" should appear in indexable text.

---

## 9. Open items (owner will supply; build around constants)

1. Final domain (SITE_DOMAIN).
2. Contact email (CONTACT_EMAIL) - geohound@mapscaping.com used in drafts.
3. Chrome Web Store URL (CHROME_STORE_URL) - post-publication.
4. Founder name/photo on /about - optional, owner's call.
5. Prices may rise - packs must be trivially editable.
6. Seller legal/business name for /terms and the footer imprint (owner is
   finalising the Stripe business name; use a SELLER_NAME constant).
7. The Chrome Web Store listing's privacy-policy, homepage, and support
   URLs will all point at THIS site.
