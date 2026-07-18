import type { Metadata } from 'next';
import Link from 'next/link';
import { CLUSTERS, GUIDES, guidesInCluster, type GuideCluster } from '@/lib/guides';
import { SITE_URL } from '@/lib/constants';
import styles from './hub.module.css';

export const metadata: Metadata = {
  title: 'Guides: finding and using the data behind web maps',
  description:
    'Practical guides to finding the WMS, WFS, and ArcGIS services behind public web maps, loading them into QGIS, and analysing them without desktop GIS.',
  alternates: { canonical: '/guides' },
};

const ORDER: GuideCluster[] = ['finding-data', 'using-data', 'analysis'];

/* The hub is the crawlable index for the whole cluster. The landing page links
   here, and this links to every guide, so each guide is two hops from the home
   page without cluttering the marketing narrative with twelve article links. */
function StructuredData() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Geo Hound guides',
    url: `${SITE_URL}/guides`,
    hasPart: GUIDES.map((g) => ({
      '@type': 'Article',
      headline: g.title,
      description: g.description,
      url: `${SITE_URL}/guides/${g.slug}`,
      dateModified: g.updated,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function GuidesHub() {
  return (
    <>
      <StructuredData />
      <span className="gh-label gh-eyebrow">Guides</span>
      <h1>Finding and using the data behind web maps.</h1>
      <p className={styles.lede}>
        Public web maps are full of data that is technically available and practically
        hidden. These are the working notes: how to find the service behind a viewer, how
        to get it into the software you use, and how to answer a question with it. Most of
        it is doable by hand. Geo Hound just makes it quick.
      </p>

      {ORDER.map((cluster) => {
        const guides = guidesInCluster(cluster);
        if (guides.length === 0) return null;
        return (
          <section key={cluster} className={styles.cluster}>
            <h2 className={styles.clusterHead}>{CLUSTERS[cluster].label}</h2>
            <p className={styles.clusterBlurb}>{CLUSTERS[cluster].blurb}</p>
            <ul className={styles.grid}>
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`} className={`gh-card ${styles.card}`}>
                    <h3 className={styles.cardTitle}>{g.title}</h3>
                    <p className={styles.cardSummary}>{g.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
