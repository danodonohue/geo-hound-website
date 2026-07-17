import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { GUIDES } from '@/lib/guides';

/**
 * The sitemap is generated from the same registry the pages render from, so a
 * new guide is listed the moment it is added to GUIDES. A hand-maintained
 * sitemap drifts; this one cannot.
 *
 * Priorities reflect what we want ranked, not wishful thinking: the landing
 * page and pricing carry the commercial intent, the guides carry the long tail,
 * and the legal pages exist to be found by people who go looking for them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date('2026-07-17');

  const core: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/support`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const docs: MetadataRoute.Sitemap = [
    '/docs/detector',
    '/docs/workbench',
    '/docs/assistant',
    '/docs/faq',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const guides: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/guides`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...GUIDES.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      lastModified: new Date(g.updated),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ];

  const legal: MetadataRoute.Sitemap = ['/privacy', '/terms'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  return [...core, ...docs, ...guides, ...legal];
}
