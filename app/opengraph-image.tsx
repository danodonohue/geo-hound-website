import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Geo Hound: find the GIS data behind any web map';

export default function Image() {
  return ogImage({
    title: 'The GIS data behind any web map. Found, saved, ready to analyse.',
    caption: 'CHROME EXTENSION / FREE TO INSTALL',
  });
}
