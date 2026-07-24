// One-time generator: fetch Natural Earth 110m land polygons, round
// coordinates to one decimal place, drop tiny rings, and save the result for
// the ExtentMap SVG component. Re-run only if the outline file is lost.
import { writeFile } from 'node:fs/promises';

const SRC = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_land.json';

const geo = await (await fetch(SRC)).json();
const rings = [];
for (const f of geo.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    const rounded = poly[0].map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
    // Rounding collapses nearby vertices; drop consecutive duplicates.
    const ring = rounded.filter(([x, y], i) => i === 0 || x !== rounded[i - 1][0] || y !== rounded[i - 1][1]);
    if (ring.length >= 12) rings.push(ring);
  }
}
await writeFile(new URL('../../components/directory/world-outline.json', import.meta.url),
  JSON.stringify(rings));
console.log(`rings: ${rings.length}`);
