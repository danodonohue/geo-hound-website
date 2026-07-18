'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GUIDES } from '@/lib/guides';
import { SITE_URL } from '@/lib/constants';
import styles from './Breadcrumbs.module.css';

/**
 * Visible breadcrumb trail plus BreadcrumbList structured data.
 *
 * Two jobs: give a reader deep in a guide a one-click way back up (the only
 * other route was the footer), and tell search engines the page hierarchy so
 * the SERP can render a breadcrumb instead of a bare URL. Both matter for the
 * guide cluster, which is the whole SEO play.
 *
 * Leaf labels are resolved from the same registries the pages render from, so a
 * crumb can never drift from the page title it points at.
 */

/* Each section's hub label and its actual hub URL. The docs hub is
   /how-it-works, not /docs (there is no /docs page), so the crumb must point
   there or it 404s. */
const SECTIONS: Record<string, { label: string; hub: string }> = {
  guides: { label: 'Guides', hub: '/guides' },
  docs: { label: 'Documentation', hub: '/how-it-works' },
};

const DOC_LEAF: Record<string, string> = {
  detector: 'Detector',
  workbench: 'Workbench',
  assistant: 'Assistant',
  faq: 'FAQ',
};

function leafLabel(section: string, slug: string): string {
  if (section === 'guides') {
    return GUIDES.find((g) => g.slug === slug)?.title ?? slug;
  }
  if (section === 'docs') {
    return DOC_LEAF[slug] ?? slug;
  }
  return slug;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);

  /* Only render on a section leaf: /guides/x or /docs/x. The hub pages and
     top-level pages do not need a trail. */
  if (parts.length < 2) return null;
  const [section, slug] = parts;
  const cfg = SECTIONS[section];
  if (!cfg) return null;

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: cfg.label, href: cfg.hub },
    { name: leafLabel(section, slug), href: `/${section}/${slug}` },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.href === '/' ? '' : c.href}`,
    })),
  };

  return (
    <nav className={styles.trail} aria-label="Breadcrumb">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className={styles.list}>
        {crumbs.slice(0, -1).map((c) => (
          <li key={c.href} className={styles.item}>
            <Link href={c.href} className={styles.link}>
              {c.name}
            </Link>
            <span className={styles.sep} aria-hidden="true">
              /
            </span>
          </li>
        ))}
        <li className={styles.current} aria-current="page">
          {crumbs[crumbs.length - 1].name}
        </li>
      </ol>
    </nav>
  );
}
