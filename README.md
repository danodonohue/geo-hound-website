# Geo Hound Website

Companion website for the Geo Hound Chrome extension. Built as a standalone
Next.js (App Router) site deployed on Vercel. This folder starts as the
brief package for the AI designer and becomes the website codebase.

Start here, in order:

1. `DESIGN-BRIEF.md` - the master brief: product, audience, story, sitemap,
   per-page requirements, visual system, voice, tech constraints.
2. `assets/tokens.css` - the extension's exact Layered Paper design tokens
   (light + dark). Non-negotiable source of truth for colour/type/shape.
3. `COMPLIANCE-CHROME-WEB-STORE.md` - the pages the Chrome Web Store
   requires this site to host and what they must say.
4. `SCREENSHOTS.md` - imagery plan: what exists, what to capture, specs.

Process: mockups (landing + one interior page, both themes) for owner
approval FIRST, then build.

Hard rules that override everything else:

- No emoji or dingbat characters anywhere (source, copy, commit messages).
- Use the tokens verbatim; the site must look like the extension's sibling.
- Pricing and contact details live in constants/content files, never
  hard-coded into components or imagery.
