import type { Metadata } from 'next';
import Link from 'next/link';
import { featured, getAllServices, placeHubs, themeHubs } from '@/lib/directory';
import { SITE_URL } from '@/lib/constants';
import { DirectorySearch } from '@/components/directory/DirectorySearch';
import { ServiceCard } from '@/components/directory/ServiceCard';
import { InstallCta } from '@/components/InstallCta';
import styles from './data.module.css';

export const metadata: Metadata = {
  title: 'Data directory: live GIS services, documented',
  description:
    'A directory of live WMS, WFS, and ArcGIS REST services found by Geo Hound users, each verified alive and documented with layers, fields, and connection instructions.',
  alternates: { canonical: '/data' },
};

function StructuredData() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Geo Hound data directory',
    url: `${SITE_URL}/data`,
    hasPart: getAllServices().map((s) => ({
      '@type': 'Dataset',
      name: s.title,
      description: s.description,
      url: `${SITE_URL}/data/${s.slug}`,
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
  );
}

export default function DataLanding() {
  const services = getAllServices();
  const places = placeHubs();
  const themes = themeHubs();

  return (
    <>
      <StructuredData />
      <span className="gh-label gh-eyebrow">Data directory</span>
      <h1>Live GIS services, documented.</h1>
      <p className={styles.lede}>
        {services.length} mapping {services.length === 1 ? 'service' : 'services'} found
        by Geo Hound users while browsing the web: WMS, WFS, and ArcGIS REST endpoints,
        each verified alive on a stated date and documented with its layers, fields, and
        copy-paste connection instructions for QGIS, ArcGIS Pro, Leaflet, and Python.
      </p>

      {services.length === 0 ? (
        <p>The first batch has not landed yet. Check back shortly.</p>
      ) : (
        <>
          <section className={styles.section}>
            <DirectorySearch />
          </section>

          <section className={styles.section}>
            <h2>Featured services</h2>
            <ul className={styles.grid}>
              {featured(6).map((s) => (
                <li key={s.slug}><ServiceCard service={s} /></li>
              ))}
            </ul>
          </section>

          {(places.length > 0 || themes.length > 0) && (
            <section className={`${styles.section} ${styles.hubLists}`}>
              {places.length > 0 && (
                <div>
                  <h2>By place</h2>
                  <ul className={styles.hubList}>
                    {places.map((h) => (
                      <li key={h.slug}>
                        <Link href={`/data/place/${h.slug}`}>
                          <span>{h.label}</span>
                          <span className={styles.hubCount}>{h.services.length}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {themes.length > 0 && (
                <div>
                  <h2>By theme</h2>
                  <ul className={styles.hubList}>
                    {themes.map((h) => (
                      <li key={h.slug}>
                        <Link href={`/data/theme/${h.slug}`}>
                          <span>{h.label}</span>
                          <span className={styles.hubCount}>{h.services.length}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </>
      )}

      <div className={styles.ctaStrip}>
        <p>
          These pages exist because the Geo Hound extension notices map services
          as its users browse. Install it and your finds can end up here too.
        </p>
        <InstallCta size="md" />
      </div>
    </>
  );
}
