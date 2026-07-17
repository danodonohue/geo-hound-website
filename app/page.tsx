import type { Metadata } from 'next';
import Link from 'next/link';
import { Plate } from '@/components/Plate';
import { InstallCta } from '@/components/InstallCta';
import {
  ArrowRightIcon,
  BuildingsIcon,
  ChatIcon,
  CheckIcon,
  CompassIcon,
  CrosshairIcon,
  NewspaperIcon,
  PlantIcon,
  StackIcon,
} from '@/components/icons';
import {
  ASSISTANT_PROMPTS,
  SERVICE_GROUPS,
  SERVICE_TYPE_COUNT,
  USE_CASES,
} from '@/lib/content';
import {
  ASSISTANT_TOOL_COUNT,
  CREDIT_PACKS,
  FREE_QUESTIONS_PER_MONTH,
  MAPSCALING_URL,
  SITE_URL,
  formatPrice,
} from '@/lib/constants';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Geo Hound: find the GIS data behind any web map',
  description: `Geo Hound detects WMS, WFS, ArcGIS FeatureServer and other GIS service and file types on any page as you browse, then lets you map, query, and analyse them in your browser. Free to install.`,
  alternates: { canonical: '/' },
};

const CASE_ICONS = {
  compass: CompassIcon,
  newspaper: NewspaperIcon,
  buildings: BuildingsIcon,
  plant: PlantIcon,
} as const;

/* Structured data. SoftwareApplication on the landing page per the brief.
   Prices come from the same constants the pricing cards read, so the markup
   cannot drift from the page. */
function StructuredData() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Geo Hound',
    applicationCategory: 'BrowserApplication',
    operatingSystem: 'Chrome',
    description:
      'Chrome extension that detects GIS services and files on any web page, then maps, queries, and analyses them in the browser.',
    url: SITE_URL,
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free to install. Detector and Workbench included.',
      },
      ...CREDIT_PACKS.map((pack) => ({
        '@type': 'Offer',
        price: String(pack.price),
        priceCurrency: 'USD',
        description: `${pack.questions} assistant questions. One-time purchase, never expires.`,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function LandingPage() {
  return (
    <>
      <StructuredData />

      {/* 1. Hero */}
      <section className={`${styles.hero} gh-graticule`}>
        <div className={`gh-wrap ${styles.heroGrid}`}>
          <div>
            <span className="gh-label gh-eyebrow">Chrome extension</span>
            <h1 className={styles.heroTitle}>
              The GIS data behind any web map. Found, saved, ready to analyse.
            </h1>
            <p className={styles.heroSub}>
              Geo Hound spots the map services on a page as you browse, then lets you map,
              query, and analyse them right in your browser. No DevTools. No desktop GIS
              required.
            </p>
            <div className={styles.heroActions}>
              <InstallCta />
              <Link href="/how-it-works" className="gh-btn gh-btn--lg">
                See how it works
                <ArrowRightIcon size={15} />
              </Link>
            </div>
            <p className={styles.heroNote}>
              Free to install. The detector and workbench are free. The assistant gives you up to{' '}
              {FREE_QUESTIONS_PER_MONTH} free questions a month.
            </p>
          </div>

          <Plate
            fig="01"
            caption="WORKBENCH / SAVED SERVICE AS A LIVE LAYER"
            priority
            pendingNote="L2: workbench hero, light theme"
          />
        </div>
      </section>

      {/* 2. The pain, in one image */}
      <section className={`gh-section ${styles.pain}`}>
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">The old way</span>
          <h2 className="gh-measure">
            You should not need the network tab to find out what is drawing the map.
          </h2>
          <div className={styles.painGrid}>
            <div>
              <div className={styles.painHead}>
                <span className="gh-label">Before</span>
                <span className="gh-faint" style={{ fontSize: 13 }}>
                  Open DevTools, watch requests, scroll, guess, copy, clean up the URL.
                </span>
              </div>
              <Plate
                fig="02a"
                caption="DEVTOOLS / NETWORK TAB ON A PUBLIC MAP VIEWER"
                pendingNote="O2: owner capture, the old way"
              />
            </div>
            <div>
              <div className={styles.painHead}>
                <span className="gh-label">After</span>
                <span className="gh-faint" style={{ fontSize: 13 }}>
                  Browse the map. The services are caught, named, and saved.
                </span>
              </div>
              <Plate
                fig="02b"
                caption="GEO HOUND / POPUP WITH DETECTED SERVICES"
                pendingNote="L1: popup, light theme"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three layers */}
      <section className="gh-section">
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">How it fits together</span>
          <h2 className="gh-measure">Three layers, in the order you meet them.</h2>

          <div className={styles.layerRow}>
            <div className={styles.layerCopy}>
              <span className={styles.layerNum}>
                <CrosshairIcon size={22} className={styles.layerIcon} />
                <span className="gh-label">Layer 1 / Detector</span>
                <span className={styles.priceTag}>free</span>
              </span>
              <h3 className={styles.layerTitle}>It watches the network so you do not have to.</h3>
              <p className={styles.layerBody}>
                As you browse, Geo Hound reads the traffic and the page for geospatial
                services and files, and saves what it finds with its metadata. The toolbar
                badge counts them as they arrive.
              </p>
              <ul className={styles.featureList}>
                <li>
                  <CheckIcon size={16} />
                  <span>
                    Detects {SERVICE_TYPE_COUNT} service and file types, from WMS and
                    FeatureServer to OGC API and GeoPackage.
                  </span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>
                    Saves title, provider, layers, keywords, CRS, and bounding box. Sort into
                    folders, search across the lot.
                  </span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>
                    Tests CORS, and hands you the URL pre-formatted for QGIS or ArcGIS Pro.
                  </span>
                </li>
              </ul>
            </div>
            <Plate
              fig="03"
              caption="DETECTOR / SERVICE CARD, METADATA AND CORS BADGE"
              pendingNote="L5: service card detail"
            />
          </div>

          <div className={styles.layerRow}>
            <div className={styles.layerCopy}>
              <span className={styles.layerNum}>
                <StackIcon size={22} className={styles.layerIcon} />
                <span className="gh-label">Layer 2 / Workbench</span>
                <span className={styles.priceTag}>free</span>
              </span>
              <h3 className={styles.layerTitle}>A GIS workspace, in a browser tab.</h3>
              <p className={styles.layerBody}>
                Saved services become live map layers. Import your own files alongside them,
                then do the work: filter, select, analyse, symbolize, export. Sessions save
                themselves and come back when you return.
              </p>
              <ul className={styles.featureList}>
                <li>
                  <CheckIcon size={16} />
                  <span>
                    Attribute table with an AND/OR filter builder, column stats, and CSV
                    export.
                  </span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>
                    Buffer, spatial join, nearest distance, select by location, split
                    multipart. Result layers chain into further analysis.
                  </span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>
                    Export to GeoJSON, KML, Shapefile, XLSX, CSV, a PNG map, or a PDF report.
                  </span>
                </li>
              </ul>
            </div>
            <Plate
              fig="04"
              caption="WORKBENCH / ATTRIBUTE TABLE AND FILTER BUILDER"
              pendingNote="L3 or W3: dark theme workbench"
            />
          </div>

          <div className={styles.layerRow}>
            <div className={styles.layerCopy}>
              <span className={styles.layerNum}>
                <ChatIcon size={22} className={styles.layerIcon} />
                <span className="gh-label">Layer 3 / Assistant</span>
                <span className={styles.priceTag}>up to {FREE_QUESTIONS_PER_MONTH} free a month</span>
              </span>
              <h3 className={styles.layerTitle}>
                GIS analysis for people who do not know GIS software.
              </h3>
              <p className={styles.layerBody}>
                An assistant that sits inside the workbench and drives it for you, using{' '}
                {ASSISTANT_TOOL_COUNT} tools. You do not need to know what a spatial join is.
                You just ask the question.
              </p>
              <ul className={styles.featureList}>
                <li>
                  <CheckIcon size={16} />
                  <span>Ask in plain English. It queries, buffers, joins, styles, exports.</span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>
                    Only layer schemas, counts, and small capped samples are sent to the
                    model. Your datasets are not uploaded wholesale.
                  </span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>Conversations are not stored on our servers.</span>
                </li>
              </ul>
            </div>
            <Plate
              fig="05"
              caption="ASSISTANT / A QUESTION AND THE MAP THAT ANSWERED IT"
              pendingNote="L4: assistant mid-conversation"
            />
          </div>
        </div>
      </section>

      {/* 4. Assistant spotlight */}
      <section className={`gh-section ${styles.spotlight}`}>
        <div className="gh-wrap">
          <div className={styles.spotlightHead}>
            <span className="gh-label gh-eyebrow">The assistant</span>
            <h2>Do not like a colour? Tell it. Need a number? Ask it.</h2>
          </div>

          <div className={styles.spotlightGrid}>
            {/* An illustration of the interface, not a transcript. It shows the
                credit model honestly: the question costs one credit, the tool
                steps it takes are free. */}
            <div className={styles.chat}>
              <div className={styles.chatHead}>
                <span className="gh-label">Assistant</span>
                <span className={styles.pill}>7 questions left</span>
              </div>
              <div className={styles.chatBody}>
                <div className={`${styles.turn} ${styles.turnUser}`}>
                  <span className="gh-label">You</span>
                  <p className={`${styles.bubble} ${styles.bubbleUser}`}>
                    Buffer the wells by 500 metres and tell me how many parcels fall inside.
                  </p>
                </div>

                <div className={styles.turn}>
                  <span className="gh-label">Geo Hound</span>
                  <ul className={styles.steps}>
                    <li className={styles.step}>buffer / wells / 500 m</li>
                    <li className={styles.step}>select_by_location / parcels</li>
                    <li className={styles.step}>get_statistics / count</li>
                  </ul>
                  <p className={styles.stepNote}>
                    Tool steps are free. The question cost 1 credit.
                  </p>
                  <p className={`${styles.bubble} ${styles.bubbleAssistant}`}>
                    134 parcels fall inside the 500 m buffer. I have added the buffer as a new
                    layer and selected the parcels on the map so you can export them.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="gh-muted" style={{ marginBottom: 18 }}>
                Some of what people type. Each one is a real command the assistant can carry
                out on the data already in front of you.
              </p>
              <div className={styles.prompts}>
                {ASSISTANT_PROMPTS.map((p) => (
                  <div key={p.prompt} className={styles.promptRow}>
                    <span className="gh-label">{p.category}</span>
                    <p className={styles.promptText}>{p.prompt}</p>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 22 }}>
                <Link href="/docs/assistant" className="gh-btn">
                  Read the prompt cookbook
                  <ArrowRightIcon size={15} />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Use-case vignettes */}
      <section className="gh-section">
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">Who uses it</span>
          <h2 className="gh-measure">Two audiences, the same public map data.</h2>
          <div className={styles.caseGrid}>
            {USE_CASES.map((c) => {
              const CaseIcon = CASE_ICONS[c.icon];
              return (
                <article key={c.audience} className="gh-card">
                  <CaseIcon size={24} className={styles.caseIcon} />
                  <h3 style={{ fontSize: '0.9375rem' }}>{c.audience}</h3>
                  <p className={styles.caseBody}>{c.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Service-type wall */}
      <section className={`gh-section ${styles.wall}`}>
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">What it catches</span>
          <h2 className="gh-measure">
            {SERVICE_TYPE_COUNT} service and file types, detected as you browse.
          </h2>
          <div className={styles.wallGrid}>
            {SERVICE_GROUPS.map((group) => (
              <div key={group.heading} className={styles.wallGroup}>
                <p className="gh-label">{group.heading}</p>
                <ul className={styles.wallList}>
                  {group.items.map((item) => (
                    <li key={item} className={styles.chip}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Pricing teaser */}
      <section className="gh-section">
        <div className={`gh-wrap ${styles.teaser}`}>
          <div>
            <span className="gh-label gh-eyebrow">Pricing</span>
            <h2>Free to install. Pay once, if you ever need to.</h2>
            <ul className={styles.teaserPoints}>
              <li>
                <CheckIcon size={16} />
                <span>The detector and workbench are free forever.</span>
              </li>
              <li>
                <CheckIcon size={16} />
                <span>
                  The assistant gives everyone up to {FREE_QUESTIONS_PER_MONTH} free questions a
                  month.
                </span>
              </li>
              <li>
                <CheckIcon size={16} />
                <span>
                  After that, credit packs from {formatPrice(CREDIT_PACKS[0].price)} for{' '}
                  {CREDIT_PACKS[0].questions} questions. Buy once. They never expire. No
                  subscription.
                </span>
              </li>
            </ul>
          </div>
          <Link href="/pricing" className="gh-btn gh-btn--lg gh-btn--primary">
            See pricing
            <ArrowRightIcon size={15} />
          </Link>
        </div>
      </section>

      {/* 8. MapScaping strip */}
      <section className={`gh-section ${styles.strip}`}>
        <div className="gh-wrap">
          <div className={styles.stripInner}>
            <div className={styles.stripCopy}>
              <span className="gh-label gh-eyebrow">
                From the maker of the MapScaping Podcast
              </span>
              <p>
                Geo Hound is a MapScaping product, built by a GIS specialist who got tired of
                digging through network requests to find the data behind a map.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/about" className="gh-btn">
                Read the story
              </Link>
              <a href={MAPSCALING_URL} className="gh-btn">
                mapscaping.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
