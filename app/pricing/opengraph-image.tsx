import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Geo Hound pricing: free to install, pay once for credits that never expire';

export default function Image() {
  return ogImage({
    eyebrow: 'Geo Hound / Pricing',
    title: 'Free to install. Pay once, if you ever need to.',
    caption: 'DETECTOR AND WORKBENCH FREE / CREDITS NEVER EXPIRE',
  });
}
