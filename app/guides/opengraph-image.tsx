import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

/* Applies to the guides hub and every guide under it. */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Geo Hound guides: finding and using the data behind web maps';

export default function Image() {
  return ogImage({
    eyebrow: 'Geo Hound / Guides',
    title: 'Finding and using the data behind web maps.',
    caption: 'FIELD NOTES / WMS, WFS, ARCGIS REST, TILES',
  });
}
