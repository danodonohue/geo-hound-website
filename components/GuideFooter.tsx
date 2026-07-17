import Link from 'next/link';
import { InstallCta } from '@/components/InstallCta';
import { ArrowRightIcon } from '@/components/icons';
import { getGuide } from '@/lib/guides';
import { FREE_QUESTIONS_PER_MONTH, SITE_URL } from '@/lib/constants';
import styles from './GuideFooter.module.css';

const DOC_LABELS: Record<string, string> = {
  '/docs/detector': 'Detector documentation',
  '/docs/workbench': 'Workbench documentation',
  '/docs/assistant': 'Assistant documentation',
  '/docs/faq': 'Frequently asked questions',
};

/**
 * Closes every guide: the install call to action, then the onward links.
 *
 * The CTA is the point of the guide. Someone arriving from a search for "find
 * WMS URL behind web map" has the problem this product solves, right now, so
 * the ask is direct rather than coy.
 *
 * The related and docs links exist for two readers at once: a person who wants
 * the next thing, and a crawler working out that these pages are one topic.
 * getGuide throws on an unknown slug, so a typo fails the build instead of
 * shipping a dead internal link.
 */
export function GuideFooter({ slug }: { slug: string }) {
  const guide = getGuide(slug);
  const related = guide.related.map(getGuide);

  /* Article markup lives here rather than in each .mdx file: every guide ends
     with this component, so emitting it here means a guide cannot ship without
     its structured data, and the fields come from the registry rather than
     being retyped per page. */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    url: `${SITE_URL}/guides/${guide.slug}`,
    dateModified: guide.updated,
    author: { '@type': 'Organization', name: 'MapScaping' },
    publisher: { '@type': 'Organization', name: 'MapScaping', url: 'https://mapscaping.com' },
    isPartOf: { '@type': 'CollectionPage', name: 'Geo Hound guides', url: `${SITE_URL}/guides` },
  };

  return (
    <div className={styles.wrap}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <aside className={`${styles.cta} gh-ticks`}>
        <span className="gh-label">Do this automatically</span>
        <p className={styles.ctaTitle}>Stop digging for service URLs.</p>
        <p className={styles.ctaBody}>
          Geo Hound watches the network while you browse and catches the map services on
          every page, with their metadata, ready for QGIS or ArcGIS Pro. It is free to
          install, and the workbench that maps and analyses what it finds is free too. The
          assistant gives you up to {FREE_QUESTIONS_PER_MONTH} free questions a month.
        </p>
        <div className={styles.ctaActions}>
          <InstallCta />
          <Link href="/pricing" className="gh-btn gh-btn--lg">
            See pricing
          </Link>
        </div>
      </aside>

      <div className={styles.links}>
        {related.length > 0 ? (
          <nav className={styles.linkGroup} aria-label="Related guides">
            <p className="gh-label">Related guides</p>
            <ul className={styles.list}>
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/guides/${r.slug}`} className={styles.link}>
                    <ArrowRightIcon size={14} />
                    <span>{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {guide.docsLinks.length > 0 ? (
          <nav className={styles.linkGroup} aria-label="Documentation">
            <p className="gh-label">In the documentation</p>
            <ul className={styles.list}>
              {guide.docsLinks.map((href) => (
                <li key={href}>
                  <Link href={href} className={styles.link}>
                    <ArrowRightIcon size={14} />
                    <span>{DOC_LABELS[href] ?? href}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
