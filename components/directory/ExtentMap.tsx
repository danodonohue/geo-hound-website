import rings from './world-outline.json';
import styles from './directory.module.css';

/* Equirectangular projection onto a 720x360 frame: 2 SVG units per degree. */
const X = (lon: number) => (lon + 180) * 2;
const Y = (lat: number) => (90 - lat) * 2;

function ringPath(ring: number[][]) {
  return ring.map(([lon, lat], i) => `${i === 0 ? 'M' : 'L'}${X(lon)} ${Y(lat)}`).join('') + 'Z';
}

export function ExtentMap({ bbox, title }: {
  bbox: [number, number, number, number] | null;
  title: string;
}) {
  return (
    <figure className={styles.extent}>
      <svg viewBox="0 0 720 360" role="img"
        aria-label={bbox ? `Coverage extent of ${title}` : `Extent unknown for ${title}`}>
        <rect x="0" y="0" width="720" height="360" className={styles.extentFrame} />
        {Array.from({ length: 11 }, (_, i) => (i + 1) * 30).map((lon) => (
          <line key={`x${lon}`} x1={lon * 2} y1={0} x2={lon * 2} y2={360} className={styles.graticule} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (i + 1) * 30).map((lat) => (
          <line key={`y${lat}`} x1={0} y1={lat * 2} x2={720} y2={lat * 2} className={styles.graticule} />
        ))}
        {(rings as number[][][]).map((ring, i) => (
          <path key={i} d={ringPath(ring)} className={styles.land} />
        ))}
        {bbox && (
          <rect
            x={X(bbox[0])} y={Y(bbox[3])}
            width={Math.max(6, X(bbox[2]) - X(bbox[0]))}
            height={Math.max(6, Y(bbox[1]) - Y(bbox[3]))}
            className={styles.extentBox}
          />
        )}
      </svg>
      <figcaption className={styles.extentCaption}>
        {bbox
          ? `${bbox[0].toFixed(1)}, ${bbox[1].toFixed(1)} to ${bbox[2].toFixed(1)}, ${bbox[3].toFixed(1)} (WGS84)`
          : 'Extent not published by this service'}
      </figcaption>
    </figure>
  );
}
