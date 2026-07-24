import type { DirectoryService } from '@/lib/directory';
import { CopyButton } from './CopyButton';
import styles from './directory.module.css';

type Snippet = { client: string; code: string };

/**
 * Copy-paste connection instructions generated from the record itself. Every
 * URL comes from the data file; nothing here is hand-written per service.
 */
function snippetsFor(s: DirectoryService): Snippet[] {
  const out: Snippet[] = [];
  const esri = s.type.startsWith('ESRI');
  const firstLayer = s.layers[0];
  const vectorLayerId = firstLayer?.id ?? 0;

  if (s.type === 'OGC WMS') {
    out.push({
      client: 'QGIS',
      code: `Layer > Add Layer > Add WMS/WMTS Layer > New\nName: ${s.title}\nURL: ${s.url.split('?')[0]}`,
    });
    out.push({
      client: 'ArcGIS Pro',
      code: `Insert > Connections > Server > New WMS Server\nServer URL: ${s.url.split('?')[0]}`,
    });
    out.push({
      client: 'Leaflet',
      code: `L.tileLayer.wms('${s.url.split('?')[0]}', {\n  layers: '${firstLayer?.name ?? ''}',\n  format: 'image/png',\n  transparent: true,\n}).addTo(map);`,
    });
    out.push({
      client: 'Python',
      code: `import requests\nparams = {\n    'SERVICE': 'WMS', 'REQUEST': 'GetMap', 'VERSION': '1.3.0',\n    'LAYERS': '${firstLayer?.name ?? ''}', 'CRS': 'EPSG:4326',\n    'BBOX': '-90,-180,90,180', 'WIDTH': 720, 'HEIGHT': 360,\n    'FORMAT': 'image/png',\n}\npng = requests.get('${s.url.split('?')[0]}', params=params).content`,
    });
  } else if (esri) {
    out.push({
      client: 'QGIS',
      code: `Layer > Add Layer > Add ArcGIS REST Server Layer > New\nName: ${s.title}\nURL: ${s.url}`,
    });
    out.push({
      client: 'ArcGIS Pro',
      code: `Insert > Connections > Server > New ArcGIS Server\nServer URL: ${s.url}`,
    });
    if (s.type === 'ESRI FeatureServer' || s.type === 'ESRI MapServer') {
      out.push({
        client: 'Leaflet',
        code: `fetch('${s.url}/${vectorLayerId}/query?where=1%3D1&outFields=*&f=geojson')\n  .then((r) => r.json())\n  .then((geojson) => L.geoJSON(geojson).addTo(map));`,
      });
      out.push({
        client: 'Python',
        code: `import geopandas as gpd\ngdf = gpd.read_file(\n    '${s.url}/${vectorLayerId}/query?where=1%3D1&outFields=*&f=geojson'\n)`,
      });
    }
  } else if (s.type === 'OGC WFS' || s.type === 'OGC API - Features') {
    out.push({
      client: 'QGIS',
      code: `Layer > Add Layer > Add WFS Layer > New\nName: ${s.title}\nURL: ${s.url.split('?')[0]}`,
    });
    out.push({
      client: 'Python',
      code: `import geopandas as gpd\ngdf = gpd.read_file(\n    '${s.url.split('?')[0]}?service=WFS&request=GetFeature'\n    '&outputFormat=application/json&count=1000'\n)`,
    });
  } else if (s.type === 'XYZ Tiles') {
    out.push({
      client: 'QGIS',
      code: `Browser panel > XYZ Tiles > New Connection\nName: ${s.title}\nURL: ${s.url}`,
    });
    out.push({
      client: 'Leaflet',
      code: `L.tileLayer('${s.url}').addTo(map);`,
    });
  }
  return out;
}

export function ConnectSnippets({ service }: { service: DirectoryService }) {
  const snippets = snippetsFor(service);
  if (snippets.length === 0) return null;
  return (
    <>
      {snippets.map(({ client, code }) => (
        <figure key={client} className={`gh-card ${styles.snippet}`}>
          <div className={styles.snippetHead}>
            <span className="gh-label">{client}</span>
            <CopyButton text={code} />
          </div>
          <pre>{code}</pre>
        </figure>
      ))}
    </>
  );
}
