import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

/* Applies to the data directory landing, datasheets, and hubs under /data. */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Geo Hound data directory: live GIS services, documented';

export default function Image() {
  return ogImage({
    eyebrow: 'Geo Hound / Data directory',
    title: 'Live GIS services, documented.',
    caption: 'DATASHEETS / LAYERS, FIELDS, CONNECTIONS, HEALTH',
  });
}
