'use client';
import { useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './directory.module.css';

type Props = {
  url: string;
  type: string;
  bbox: [number, number, number, number] | null;
  layerName?: string;
  layerId?: number | string;
};

type State = 'idle' | 'loading' | 'ready' | 'failed';

const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; OpenStreetMap contributors';

/**
 * Nothing loads until the reader asks for it: the map library, the basemap
 * tiles, and the service itself are all fetched on click, so pages stay fast
 * and flaky origin servers are only contacted deliberately.
 */
export function LivePreview({ url, type, bbox, layerName, layerId }: Props) {
  const [state, setState] = useState<State>('idle');
  const [note, setNote] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  function destroy() {
    mapRef.current?.remove();
    mapRef.current = null;
    setState('idle');
    setNote(null);
  }

  async function load() {
    setState('loading');
    try {
      const L = (await import('leaflet')).default;
      if (!containerRef.current) return;
      const map = L.map(containerRef.current, { preferCanvas: true });
      mapRef.current = map;
      if (bbox) {
        map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
      } else {
        map.setView([20, 0], 2);
      }

      const needsBasemap = type !== 'ESRI MapServer' && type !== 'XYZ Tiles';
      if (needsBasemap) {
        L.tileLayer(OSM_URL, { attribution: OSM_ATTRIBUTION }).addTo(map);
      }

      if (type === 'OGC WMS') {
        const base = url.split('?')[0];
        L.tileLayer.wms(base, {
          layers: layerName ?? '',
          format: 'image/png',
          transparent: true,
        }).addTo(map);
      } else if (type === 'XYZ Tiles') {
        L.tileLayer(url).addTo(map);
      } else if (type === 'ESRI MapServer') {
        const tiles = L.tileLayer(`${url}/tile/{z}/{y}/{x}`);
        tiles.once('tileerror', () => {
          setNote('This MapServer does not serve cached tiles, so the inline preview is limited. The QGIS connection below works regardless.');
        });
        tiles.addTo(map);
      } else if (type === 'ESRI ImageServer') {
        const b = bbox ?? [-180, -85, 180, 85];
        const img = `${url}/exportImage?bbox=${b[0]},${b[1]},${b[2]},${b[3]}&bboxSR=4326&imageSR=4326&size=720,360&format=png&transparent=true&f=image`;
        L.imageOverlay(img, [[b[1], b[0]], [b[3], b[2]]], { opacity: 0.85 }).addTo(map);
      } else if (type === 'ESRI FeatureServer' || type === 'OGC WFS') {
        const query = type === 'ESRI FeatureServer'
          ? `${url}/${layerId ?? 0}/query?where=1%3D1&outFields=*&resultRecordCount=500&f=geojson`
          : `${url.split('?')[0]}?service=WFS&request=GetFeature&outputFormat=application/json&count=500${layerName ? `&typeNames=${encodeURIComponent(layerName)}` : ''}`;
        const res = await fetch(query);
        if (!res.ok) throw new Error(`preview fetch ${res.status}`);
        const geojson = await res.json();
        const layer = L.geoJSON(geojson, {
          style: { color: 'var(--gh-accent-strong)', weight: 2, fillOpacity: 0.1 },
        }).addTo(map);
        const bounds = layer.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds);
        setNote('Preview limited to the first 500 features.');
      }
      setState('ready');
    } catch {
      mapRef.current?.remove();
      mapRef.current = null;
      setState('failed');
    }
  }

  return (
    <div className={styles.preview}>
      {state !== 'ready' && state !== 'loading' && (
        <button type="button" className="gh-btn gh-btn--primary" onClick={load}>
          Load live preview
        </button>
      )}
      {state === 'loading' && <p className={styles.previewNote}>Contacting the service.</p>}
      {state === 'failed' && (
        <p className={styles.previewNote}>
          The service did not respond to a preview request. It may still work in QGIS.
        </p>
      )}
      {(state === 'ready' || state === 'loading') && (
        <div ref={containerRef} className={styles.previewMap} />
      )}
      {note && state === 'ready' && <p className={styles.previewNote}>{note}</p>}
      {state === 'ready' && (
        <button type="button" className="gh-btn" onClick={destroy}>
          Remove preview
        </button>
      )}
    </div>
  );
}
