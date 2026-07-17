/**
 * The guide cluster: long-tail articles that answer the questions people
 * actually type into a search box, each ending in an install call to action.
 *
 * Architecture note, because this drives the whole SEO approach:
 *
 * The landing page does NOT link to individual guides. It links to /guides,
 * which links to all of them. That keeps the marketing narrative clean while
 * still giving every guide a crawlable path from the home page in two hops.
 * Guides then cross-link to each other and down into /docs/*, so authority
 * flows between them rather than dead-ending.
 *
 * Every guide belongs to exactly one cluster and declares its related guides.
 * `related` is validated by a test: a slug that does not exist fails the
 * build rather than shipping a broken internal link.
 *
 * To add a guide:
 *   1. Add an entry here.
 *   2. Create app/guides/<slug>/page.mdx.
 *   3. End the MDX with <GuideFooter slug="<slug>" />.
 * The hub, the sitemap, and the related-links block pick it up automatically.
 */

export type GuideCluster = 'finding-data' | 'using-data' | 'analysis';

export type Guide = {
  slug: string;
  /** The h1. Phrased as the question or task someone searches for. */
  title: string;
  /** Meta description. Answers the query in one sentence. */
  description: string;
  /** Shown on the hub card. Shorter than the description. */
  summary: string;
  cluster: GuideCluster;
  /** The primary query this page targets. One per guide, no cannibalising. */
  targetQuery: string;
  /** Secondary queries the body should cover naturally. */
  secondaryQueries: readonly string[];
  /** Slugs of related guides. Must exist. Rendered by GuideFooter. */
  related: readonly string[];
  /** Docs pages this guide should send readers into. */
  docsLinks: readonly string[];
  /** ISO date. Shown to readers and used in the sitemap. */
  updated: string;
};

export const CLUSTERS: Record<GuideCluster, { label: string; blurb: string }> = {
  'finding-data': {
    label: 'Finding the data',
    blurb: 'Getting the service URL out of a web map that was not built to give it to you.',
  },
  'using-data': {
    label: 'Using the data',
    blurb: 'Once you have the URL, getting it into the software you actually work in.',
  },
  analysis: {
    label: 'Analysing the data',
    blurb: 'Answering a question with the data, with or without desktop GIS.',
  },
};

export const GUIDES: readonly Guide[] = [
  {
    slug: 'find-wms-url-behind-web-map',
    title: 'How to find the WMS URL behind a web map',
    description:
      'Three ways to find the WMS service URL powering a web map: read the capabilities document, dig through the browser network tab, or let a detector catch it automatically.',
    summary:
      'The service URL is in the network traffic. Here are three ways to get it out, from slowest to fastest.',
    cluster: 'finding-data',
    targetQuery: 'find WMS URL behind web map',
    secondaryQueries: [
      'how to get WMS url from website',
      'find WMS endpoint',
      'GetCapabilities url',
    ],
    related: ['extract-gis-data-from-website', 'get-data-from-arcgis-web-map', 'what-is-getcapabilities'],
    docsLinks: ['/docs/detector'],
    updated: '2026-07-17',
  },
  {
    slug: 'get-data-from-arcgis-web-map',
    title: 'How to get the data out of an ArcGIS web map',
    description:
      'How to find the FeatureServer or MapServer URL behind an ArcGIS web map or Experience Builder app, and pull the underlying data into QGIS or ArcGIS Pro.',
    summary:
      'ArcGIS viewers hide the REST endpoint, but the browser has already loaded it. Here is how to get at it.',
    cluster: 'finding-data',
    targetQuery: 'get data from ArcGIS web map',
    secondaryQueries: [
      'download data from ArcGIS online web map',
      'find FeatureServer url',
      'ArcGIS REST services directory',
    ],
    related: ['open-featureserver-in-qgis', 'find-wms-url-behind-web-map', 'featureserver-vs-mapserver'],
    docsLinks: ['/docs/detector'],
    updated: '2026-07-17',
  },
  {
    slug: 'extract-gis-data-from-website',
    title: 'How to extract GIS data from a website',
    description:
      'A practical guide to extracting geospatial data from a website: what is actually possible, which formats you can get, and where the legal and technical limits are.',
    summary:
      'What can and cannot be extracted from a public web map, and how to do the part that can.',
    cluster: 'finding-data',
    targetQuery: 'extract GIS data from website',
    secondaryQueries: [
      'scrape map data from website',
      'download GIS data from web map',
      'web map data extractor',
    ],
    related: ['find-wms-url-behind-web-map', 'get-data-from-arcgis-web-map', 'download-geojson-from-web-map'],
    docsLinks: ['/docs/detector', '/docs/workbench'],
    updated: '2026-07-17',
  },
  {
    slug: 'find-xyz-tile-url',
    title: 'How to find the XYZ tile URL a map is using',
    description:
      'How to identify the XYZ or vector tile template behind a slippy map, what the z/x/y placeholders mean, and how to add the tile layer to QGIS.',
    summary:
      'Slippy maps request tiles by z/x/y. Find one request and you have the whole template.',
    cluster: 'finding-data',
    targetQuery: 'find XYZ tile url',
    secondaryQueries: ['xyz tile layer url', 'vector tile url', 'add xyz tiles to qgis'],
    related: ['find-wms-url-behind-web-map', 'extract-gis-data-from-website'],
    docsLinks: ['/docs/detector'],
    updated: '2026-07-17',
  },
  {
    slug: 'open-featureserver-in-qgis',
    title: 'How to open an ArcGIS FeatureServer in QGIS',
    description:
      'Step by step: add an ArcGIS FeatureServer or MapServer layer to QGIS using the ArcGIS REST Servers connection, including what to do when the URL will not load.',
    summary:
      'QGIS speaks ArcGIS REST natively. The trick is knowing which part of the URL to give it.',
    cluster: 'using-data',
    targetQuery: 'open FeatureServer in QGIS',
    secondaryQueries: [
      'add ArcGIS REST server to QGIS',
      'QGIS ArcGIS FeatureServer connection',
      'load MapServer in QGIS',
    ],
    related: ['get-data-from-arcgis-web-map', 'featureserver-vs-mapserver', 'why-wont-service-load-cors'],
    docsLinks: ['/docs/detector'],
    updated: '2026-07-17',
  },
  {
    slug: 'download-geojson-from-web-map',
    title: 'How to download GeoJSON or KML from a web map',
    description:
      'How to get GeoJSON, KML, or a shapefile out of a public web map, including how to export only the area you care about instead of the whole dataset.',
    summary:
      'Getting the file, and getting only the part of it you need rather than the whole country.',
    cluster: 'using-data',
    targetQuery: 'download GeoJSON from web map',
    secondaryQueries: ['download kml from web map', 'export shapefile from web map', 'save map data as geojson'],
    related: ['extract-gis-data-from-website', 'browser-gis-analysis-without-qgis'],
    docsLinks: ['/docs/detector', '/docs/workbench'],
    updated: '2026-07-17',
  },
  {
    slug: 'why-wont-service-load-cors',
    title: 'Why a map service will not load in a browser app (CORS)',
    description:
      'What CORS is, why a WMS or FeatureServer that works fine in QGIS fails in a browser app, how to test it, and what your options are when a service blocks you.',
    summary:
      'The service works in QGIS but not in your web app. Almost always, this is why.',
    cluster: 'using-data',
    targetQuery: 'web map service CORS error',
    secondaryQueries: ['CORS WMS', 'ArcGIS FeatureServer CORS', 'why does my map service not load in browser'],
    related: ['open-featureserver-in-qgis', 'featureserver-vs-mapserver'],
    docsLinks: ['/docs/detector', '/docs/faq'],
    updated: '2026-07-17',
  },
  {
    slug: 'browser-gis-analysis-without-qgis',
    title: 'How to do GIS analysis without installing QGIS',
    description:
      'Buffers, spatial joins, and attribute queries on public map data, done in a browser tab. What browser GIS can do, and where you still need a desktop package.',
    summary:
      'What you can genuinely do in a browser tab, and the honest limits of it.',
    cluster: 'analysis',
    targetQuery: 'GIS analysis without QGIS',
    secondaryQueries: ['browser GIS', 'online GIS analysis', 'GIS in the browser', 'free GIS no install'],
    related: ['ai-gis-assistant-talk-to-your-map', 'how-to-buffer-and-count', 'download-geojson-from-web-map'],
    docsLinks: ['/docs/workbench'],
    updated: '2026-07-17',
  },
  {
    slug: 'ai-gis-assistant-talk-to-your-map',
    title: 'Talking to a map: what an AI GIS assistant can actually do',
    description:
      'What it means to ask a map a question in plain English, which GIS operations an AI assistant can carry out for you, and what it cannot do.',
    summary:
      'Ask a question in plain English, get a map and a number back. What that really means in practice.',
    cluster: 'analysis',
    targetQuery: 'AI GIS assistant',
    secondaryQueries: ['talk to your map', 'chat with map data', 'AI for GIS analysis', 'natural language GIS'],
    related: ['browser-gis-analysis-without-qgis', 'how-to-buffer-and-count'],
    docsLinks: ['/docs/assistant'],
    updated: '2026-07-17',
  },
  {
    slug: 'how-to-buffer-and-count',
    title: 'How to buffer features and count what falls inside',
    description:
      'The most common GIS question there is: draw a buffer around some features and count what falls within it. Three ways to do it, in QGIS and in the browser.',
    summary:
      'The single most common GIS task, done three ways depending on what you have installed.',
    cluster: 'analysis',
    targetQuery: 'buffer and count points inside',
    secondaryQueries: ['how many features within distance', 'buffer analysis qgis', 'count points in polygon'],
    related: ['browser-gis-analysis-without-qgis', 'ai-gis-assistant-talk-to-your-map'],
    docsLinks: ['/docs/workbench', '/docs/assistant'],
    updated: '2026-07-17',
  },
  {
    slug: 'featureserver-vs-mapserver',
    title: 'FeatureServer vs MapServer: which one gives you the data?',
    description:
      'The practical difference between an ArcGIS FeatureServer, MapServer, and ImageServer, and which of them will actually hand you the underlying features.',
    summary:
      'One serves pictures, one serves features. Knowing which you are looking at saves an hour.',
    cluster: 'using-data',
    targetQuery: 'FeatureServer vs MapServer',
    secondaryQueries: ['arcgis rest service types', 'what is an ImageServer', 'MapServer export image'],
    related: ['open-featureserver-in-qgis', 'get-data-from-arcgis-web-map'],
    docsLinks: ['/docs/detector'],
    updated: '2026-07-17',
  },
  {
    slug: 'what-is-getcapabilities',
    title: 'What GetCapabilities tells you about a WMS or WFS',
    description:
      'How to read a GetCapabilities document: finding the layer names, supported projections, bounding box, and output formats a WMS or WFS will give you.',
    summary:
      'The self-describing document behind every OGC service, and the four things worth reading in it.',
    cluster: 'finding-data',
    targetQuery: 'GetCapabilities WMS',
    secondaryQueries: ['read getcapabilities xml', 'wfs getcapabilities', 'wms layer names'],
    related: ['find-wms-url-behind-web-map', 'open-featureserver-in-qgis'],
    docsLinks: ['/docs/detector'],
    updated: '2026-07-17',
  },
] as const;

export function getGuide(slug: string): Guide {
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) {
    throw new Error(
      `Unknown guide slug "${slug}". Add it to GUIDES in lib/guides.ts, or fix the reference.`,
    );
  }
  return guide;
}

export function guidesInCluster(cluster: GuideCluster): Guide[] {
  return GUIDES.filter((g) => g.cluster === cluster);
}
