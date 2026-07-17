import type { Metadata } from 'next';
import Link from 'next/link';
import { InstallCta } from '@/components/InstallCta';
import { Plate } from '@/components/Plate';
import { ArrowRightIcon, ChatIcon, CrosshairIcon, StackIcon } from '@/components/icons';
import { ASSISTANT_TOOL_COUNT, FREE_QUESTIONS_PER_MONTH, SITE_URL } from '@/lib/constants';
import { SERVICE_TYPE_COUNT } from '@/lib/content';
import { GUIDES } from '@/lib/guides';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'How Geo Hound works',
  description:
    'The whole workflow in one page: install the extension, browse a web map, and Geo Hound catches the GIS services behind it. Then map, query, and analyse them in the browser, or copy them straight into QGIS.',
  alternates: { canonical: '/how-it-works' },
};

const STEPS = [
  {
    n: '01',
    title: 'Install it and browse normally',
    body: 'There is nothing to configure. Open any site with a web map and the toolbar badge starts counting what it finds. You do not open developer tools and you do not go looking.',
  },
  {
    n: '02',
    title: 'Open the popup to see what was caught',
    body: `Each service is a card with its metadata already fetched: title, provider, layers, coordinate systems, keywords. ${SERVICE_TYPE_COUNT} service and file types are recognised, from WMS and FeatureServer to OGC API and GeoPackage.`,
  },
  {
    n: '03',
    title: 'Take it to QGIS, or keep it in the browser',
    body: 'One click copies the URL pre-formatted for QGIS or ArcGIS Pro. Or open the workbench and add it as a live layer without leaving Chrome.',
  },
  {
    n: '04',
    title: 'Do the work',
    body: 'Filter the attribute table, select across layers, buffer, join, measure distances, symbolize, annotate, export. Or open the assistant tab and just ask.',
  },
] as const;

/* HowTo structured data. The brief asks for it on the docs pages, and this is
   the page that describes the end-to-end workflow. */
function StructuredData() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to find and use the GIS data behind a web map',
    description:
      'Find the WMS, WFS, or ArcGIS REST service behind a public web map and load it into QGIS or a browser workbench.',
    url: `${SITE_URL}/how-it-works`,
    totalTime: 'PT2M',
    step: STEPS.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

const LAYERS = [
  {
    icon: CrosshairIcon,
    label: 'Detector',
    href: '/docs/detector',
    body: 'What it catches, what a service card shows, testing CORS, copying for QGIS and ArcGIS Pro, folders and search, silencing noisy sites, and downloading data for an area you draw.',
  },
  {
    icon: StackIcon,
    label: 'Workbench',
    href: '/docs/workbench',
    body: 'Adding layers, importing files, the attribute table and filter builder, selection, the analysis tools, symbology, annotations, exports, and sessions.',
  },
  {
    icon: ChatIcon,
    label: 'Assistant',
    href: '/docs/assistant',
    body: `A prompt cookbook, what the ${ASSISTANT_TOOL_COUNT} tools do, exactly what data leaves your browser, how credits work, and how to restore a balance on a new machine.`,
  },
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <StructuredData />

      <section className={`${styles.head} gh-graticule`}>
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">How it works</span>
          <h1>Browse the map. Keep the data.</h1>
          <p className={styles.lede}>
            The data behind a public web map is right there in your browser: the map drew
            itself with it. Geo Hound is the part that notices, writes it down, and hands it
            to you in a form your software will accept.
          </p>
        </div>
      </section>

      <section className="gh-section">
        <div className="gh-wrap">
          <ol className={styles.steps}>
            {STEPS.map((s) => (
              <li key={s.n} className={styles.step}>
                <span className={`gh-mono ${styles.stepNum}`}>{s.n}</span>
                <div>
                  <h2 className={styles.stepTitle}>{s.title}</h2>
                  <p className={styles.stepBody}>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.plate}>
            <Plate
              fig="H1"
              caption="POPUP / A SERVICE CARD, METADATA ALREADY FETCHED"
              pendingNote="L5: service card detail"
            />
          </div>
        </div>
      </section>

      <section className="gh-section">
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">The manual</span>
          <h2 className="gh-measure">Three layers, three sets of instructions.</h2>
          <div className={styles.layerGrid}>
            {LAYERS.map((l) => {
              const Icon = l.icon;
              return (
                <Link key={l.href} href={l.href} className={`gh-card ${styles.layerCard}`}>
                  <Icon size={24} className={styles.layerIcon} />
                  <h3 className={styles.layerTitle}>{l.label}</h3>
                  <p className={styles.layerBody}>{l.body}</p>
                  <span className={styles.layerMore}>
                    Read the documentation
                    <ArrowRightIcon size={14} />
                  </span>
                </Link>
              );
            })}
          </div>

          <p className={styles.faqLine}>
            Short questions have short answers on the{' '}
            <Link href="/docs/faq">frequently asked questions</Link> page.
          </p>
        </div>
      </section>

      {/* The guides hub. Kept off the landing page, but linked here and from the
          footer, so every guide is two hops from the home page. */}
      <section className={`gh-section ${styles.guides}`}>
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">Guides</span>
          <h2 className="gh-measure">
            How to do it by hand, and where Geo Hound saves you the trouble.
          </h2>
          <p className={styles.guidesLede}>
            Most of what Geo Hound does you can do yourself with developer tools and
            patience. These guides explain both: the manual method, and the quick one.
          </p>
          <ul className={styles.guideList}>
            {GUIDES.slice(0, 6).map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className={styles.guideLink}>
                  <ArrowRightIcon size={14} />
                  <span>{g.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 20 }}>
            <Link href="/guides" className="gh-btn">
              All {GUIDES.length} guides
            </Link>
          </p>
        </div>
      </section>

      <section className="gh-section" style={{ borderBottom: 0 }}>
        <div className="gh-wrap">
          <div className={`${styles.cta} gh-ticks`}>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Free to install.</h2>
              <p className={styles.ctaBody}>
                The detector and the workbench are free, with no account. The assistant gives
                you up to {FREE_QUESTIONS_PER_MONTH} free questions a month.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <InstallCta />
              <Link href="/pricing" className="gh-btn gh-btn--lg">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
