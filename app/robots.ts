import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

/**
 * Everything is indexable except the contact endpoint, which is a POST target
 * with nothing to crawl.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
