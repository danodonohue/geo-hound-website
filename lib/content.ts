/**
 * Site copy that is expected to change: the service-type wall, the assistant
 * prompt examples, the use-case vignettes, and the layer summaries.
 *
 * Kept as data so wording can be edited without touching a component, and so
 * every service type on the landing wall is guaranteed to exist in indexable
 * text (the docs long-tail depends on it).
 */

/* --------------------------------------------------------------------------
   The service-type wall
   Set in JetBrains Mono on the landing page. Grouped the way a GIS person
   thinks about them, not the way the code detects them.
   -------------------------------------------------------------------------- */

/**
 * VERIFIED against the extension source on 2026-07-17, not copied from the
 * brief. These are the exact type strings detectServiceType() emits
 * (lib/service-detection.js:21-98, lib/ogc-api-detection.js) and the five file
 * types background.js:444-466 assigns.
 *
 * The brief listed GML, MBTiles, and FlatGeobuf as detected file types. They
 * are not. The content script scans links for those extensions, but the
 * background script drops anything that is not one of the five below, so
 * advertising them would be a false capability claim. Do not add a type here
 * without finding it in the source first.
 *
 * Generic fallbacks ("OGC Service", "ESRI Service", "OGC API - Common") are
 * omitted: they are what the detector reports when it cannot be more specific,
 * not capabilities worth advertising.
 */
export const SERVICE_GROUPS = [
  {
    heading: 'OGC services',
    items: ['WMS', 'WFS', 'WMTS', 'WCS'],
  },
  {
    heading: 'OGC API',
    items: [
      'Features',
      'Tiles',
      'Maps',
      'Coverages',
      'Processes',
      'Records',
      'Styles',
      'EDR',
      'Routes',
      '3D GeoVolumes',
    ],
  },
  {
    heading: 'Esri ArcGIS REST',
    items: [
      'MapServer',
      'FeatureServer',
      'ImageServer',
      'GPServer',
      'GeometryServer',
      'GeocodeServer',
      'VectorTileServer',
    ],
  },
  {
    heading: 'Tiles and files',
    items: [
      'XYZ Tiles',
      'Vector Tiles',
      'Vector Tile Style',
      'GeoJSON',
      'KML/KMZ',
      'Shapefile',
      'GeoTIFF',
      'GeoPackage',
    ],
  },
] as const;

export const SERVICE_TYPE_COUNT = SERVICE_GROUPS.reduce((n, g) => n + g.items.length, 0);

/* --------------------------------------------------------------------------
   Assistant prompt examples
   Drawn from the brief. Used on the landing spotlight and, at greater length,
   in the /docs/assistant cookbook.
   -------------------------------------------------------------------------- */

export const ASSISTANT_PROMPTS = [
  {
    category: 'Styling',
    prompt: 'Make the flood zones orange and label them by name.',
  },
  {
    category: 'Analysis',
    prompt: 'Buffer the wells by 500 metres and tell me how many parcels fall inside.',
  },
  {
    category: 'Statistics',
    prompt: 'Which suburb has the most building consents?',
  },
  {
    category: 'Joins',
    prompt: 'Join the soil types onto my imported paddock boundaries.',
  },
  {
    category: 'Distance',
    prompt: 'How far is each school from the nearest fire station?',
  },
  {
    category: 'Export',
    prompt: 'Select everything inside this polygon and export it as a shapefile.',
  },
  {
    category: 'Navigation',
    prompt: 'Add a satellite basemap and zoom to my selection.',
  },
] as const;

/* --------------------------------------------------------------------------
   Use-case vignettes
   -------------------------------------------------------------------------- */

export const USE_CASES = [
  {
    audience: 'For GIS pros',
    icon: 'compass',
    body: 'A council GIS officer finds the parcels FeatureServer behind a public viewer and has it open in QGIS in one click.',
  },
  {
    audience: 'For journalists',
    icon: 'newspaper',
    body: 'A reporter asks which district has the most consented wells on a regional council map, and gets a number and a shaded map back.',
  },
  {
    audience: 'For consultants',
    icon: 'buildings',
    body: 'An environmental consultant buffers streams by 20 metres and overlays a client property boundary imported from KML.',
  },
  {
    audience: 'For landowners',
    icon: 'plant',
    body: 'A farmer imports paddock boundaries from GPX, joins public soil data onto them, and exports the result as XLSX.',
  },
] as const;
