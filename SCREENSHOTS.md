# Screenshot Manifest

Screenshots are the site's primary imagery (presented as bordered "plates"
with mono captions - see DESIGN-BRIEF.md section 6). Good news: the
extension CAN be screenshotted headlessly - we have a working Playwright
recipe that loads the MV3 extension in Chromium and drives the real UI
(the repo's `.claude/skills/verify` recipe). Owner does not need to take
these by hand unless a shot needs real-world browsing context.

## Already captured (2026-07-15, earlier headless run)

Hosted in the public GitHub repo `danodonohue/temp-files` (raw URLs);
optimized JPEGs. Useful as previews of what the recipe produces, but for
this site re-capture fresh PNG masters at 1280x800 rather than reusing
these JPEGs.

1. `geohound-popup.jpg` - popup with detected services list
2. `geohound-workbench.jpg` - workbench with map + layers
3. `geohound-attributes.jpg` - attribute table open
4. `geohound-assistant.jpg` - Assistant chat tab
5. `geohound-logo.png` - logo mark

## Master spec

- Capture at 1280x800 (Chrome Web Store's preferred size) so every shot is
  dual-purpose: store listing + website. PNG masters, optimized WebP/AVIF
  derivatives for the site.
- Capture each key shot in BOTH themes (light "paper" and dark "night
  survey"); the site alternates themes deliberately by section.
- Seed the workbench with real-looking public data (e.g. a regional
  council's parcels/hydrology FeatureServer) so shots look like real work,
  not lorem-ipsum geometry.

## Shot list (headless-capturable)

Landing page:

- L1 Popup, light theme, 6-10 detected services with folders visible
- L2 Workbench hero: map + 3-4 styled layers + legend, light theme
- L3 Workbench dark theme equivalent (for the dark-section alternation)
- L4 Assistant tab mid-conversation: user asks an analysis question,
  assistant reply + visibly changed map (e.g. symbolized layer)
- L5 Service card detail: metadata + CORS badge + "Copy for QGIS" row
  (the GIS-pro money shot)

Docs - Detector:

- D1 Toolbar badge showing a detection count on a live page
- D2 Popup service list with search + folder UI
- D3 Service details dialog (metadata, CORS, QGIS/ArcGIS URLs)
- D4 Settings: disabled URL patterns
- D5 Download dialog with AOI map selector

Docs - Workbench:

- W1 Add-layer catalog / saved services picker
- W2 File import (drag/drop or picker moment)
- W3 Attribute table + AND/OR filter builder populated
- W4 Selection on map (orange highlight) + dock stats
- W5 Buffer tool flyout with a visible purple result layer
- W6 Spatial join or nearest-distance recipe result
- W7 Symbology: symbolize-by-attribute with categories + map legend
- W8 Annotations: labeled point/line/polygon on map
- W9 Export menu open (GeoJSON/KML/Shapefile/XLSX/CSV)
- W10 PDF map report output page

Docs - Assistant:

- A1 Assistant tab fresh state with questions-left pill
- A2 Styling command: "make the flood zones orange" before/after pair
- A3 Analysis chain: buffer + count question with tool steps visible
- A4 Buy-credits panel (packs) - also used on /pricing
- A5 Restore-credits flow (email + code entry)

Needs the OWNER (real-world context, cannot be fully faked headlessly):

- O1 A real public web-map site open with the badge lit (pick a
  recognisable government map viewer; check its terms allow the shot)
- O2 DevTools network-tab "the old way" shot for the before/after section
  (any busy map site; this one is trivially capturable by hand)

Store-only assets (designer to produce in Layered Paper style):

- Small promo tile 440x280
- Marquee 1400x560 (optional but recommended)
- Icon already exists (images/icon128.png in the extension repo)
