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

export const SERVICE_GROUPS = [
  {
    heading: 'OGC services',
    items: ['WMS', 'WFS', 'WMTS', 'WCS', 'OGC API - Features', 'OGC API - Tiles'],
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
    heading: 'Tile endpoints',
    items: ['XYZ tiles', 'Vector tiles', 'Vector tile styles'],
  },
  {
    heading: 'File links',
    items: [
      'KML',
      'KMZ',
      'GeoJSON',
      'Shapefile',
      'GeoPackage',
      'GML',
      'MBTiles',
      'FlatGeobuf',
      'GeoTIFF',
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
