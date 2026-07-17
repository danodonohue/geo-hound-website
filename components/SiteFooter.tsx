import Link from 'next/link';
import {
  CONTACT_EMAIL,
  EXTENSION_VERSION,
  MAPSCALING_URL,
  SELLER_NAME,
  SELLER_NAME_CONFIRMED,
} from '@/lib/constants';
import styles from './SiteFooter.module.css';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/docs/detector', label: 'Detector' },
      { href: '/docs/workbench', label: 'Workbench' },
      { href: '/docs/assistant', label: 'Assistant' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { href: '/guides', label: 'Guides' },
      { href: '/docs/faq', label: 'FAQ' },
      { href: '/guides/find-wms-url-behind-web-map', label: 'Find a WMS URL' },
      { href: '/guides/get-data-from-arcgis-web-map', label: 'Get ArcGIS map data' },
      { href: '/guides/browser-gis-analysis-without-qgis', label: 'GIS without QGIS' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/services', label: 'Custom work' },
      { href: '/support', label: 'Support' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="gh-wrap">
        <div className={styles.columns}>
          <div className={styles.about}>
            <p className={styles.wordmark}>Geo Hound</p>
            <p className={styles.blurb}>
              Find the GIS services behind any web map, then map, query, and analyse them
              without leaving the browser.
            </p>
            <p className="gh-mono gh-faint" style={{ fontSize: 11 }}>
              Extension v{EXTENSION_VERSION}
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} className={styles.column} aria-label={col.heading}>
              <p className="gh-label">{col.heading}</p>
              <ul className={styles.list}>
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/*
          Imprint. EU DSA trader rules mean the store listing publicly displays
          the verified trader identity; this block exists so the site's stated
          identity matches it. Both values come from constants, never literals.
        */}
        <div className={styles.imprint}>
          <p>
            <span className="gh-label">Seller</span>{' '}
            <span className={SELLER_NAME_CONFIRMED ? undefined : styles.pending}>
              {SELLER_NAME}
            </span>
          </p>
          <p>
            <span className="gh-label">Contact</span>{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={styles.link}>
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className={styles.mapscaping}>
            A{' '}
            <a href={MAPSCALING_URL} className={styles.link}>
              MapScaping
            </a>{' '}
            product.
          </p>
        </div>
      </div>
    </footer>
  );
}
