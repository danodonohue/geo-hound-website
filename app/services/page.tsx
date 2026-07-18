import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/ContactForm';
import { ChatIcon, CheckIcon, CrosshairIcon, MapIcon, StackIcon } from '@/components/icons';
import { ASSISTANT_TOOL_COUNT, SITE_URL } from '@/lib/constants';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Custom work: talk-to-your-map for your own portal',
  description:
    'The team behind Geo Hound takes custom work: chat interfaces for your own web maps, custom GIS tools, data pipelines, and open-data consulting.',
  alternates: { canonical: '/services' },
};

const OFFERS = [
  {
    icon: ChatIcon,
    title: 'Talk-to-your-map, on your portal',
    body: `A chat interface against your own web map, for your own users. The same idea as the Geo Hound assistant and the same ${ASSISTANT_TOOL_COUNT}-tool approach, pointed at your data, in your branding, on your domain. Your users ask a question in plain English instead of learning your layer tree.`,
  },
  {
    icon: StackIcon,
    title: 'Custom GIS tools and web maps',
    body: 'Internal tools, public viewers, dashboards, and the awkward one-off that nothing off the shelf quite does. Built to be maintainable by whoever inherits them, not clever for its own sake.',
  },
  {
    icon: MapIcon,
    title: 'Data pipelines',
    body: 'Getting data out of the system it is trapped in and into the one that needs it, on a schedule, without someone remembering to run it. Format conversion, validation, publishing to services.',
  },
  {
    icon: CrosshairIcon,
    title: 'Making your public data usable',
    body: 'We spend our days looking at what organisations publish and why it fails. CORS, service configuration, formats, metadata that actually says something, endpoints that survive contact with a browser. If people are struggling to use your open data, we can tell you why.',
  },
] as const;

const PROCESS = [
  {
    n: '01',
    title: 'A short call',
    body: 'Half an hour. You describe the problem, we ask questions and tell you honestly whether we are the right people. No deck.',
  },
  {
    n: '02',
    title: 'A fixed-price proposal',
    body: 'Written down: what we will build, what it costs, and when it lands. One number, not an hourly rate that drifts.',
  },
  {
    n: '03',
    title: 'We build it',
    body: 'You see it working as it goes, not at the end. If the shape of the problem changes, we say so early rather than quietly absorbing it.',
  },
] as const;

function StructuredData() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Geo Hound custom GIS development',
    serviceType: 'GIS software development and consulting',
    url: `${SITE_URL}/services`,
    provider: { '@type': 'Organization', name: 'MapScaping', url: 'https://mapscaping.com' },
    description:
      'Custom chat interfaces for web maps, GIS tools, data pipelines, and consulting on publishing usable map services.',
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function ServicesPage() {
  return (
    <>
      <StructuredData />

      <section className={`${styles.head} gh-graticule`}>
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">Custom work</span>
          <h1>Want this on your web map?</h1>
          <p className={styles.lede}>
            Geo Hound puts a GIS workbench and an AI assistant on top of anybody&rsquo;s public
            map data. We can do the same for yours: on your portal, with your data, for your
            users, in your branding.
          </p>
          <p className={styles.ledeSmall}>
            Same team, same code, pointed at your problem.
          </p>
          <div className={styles.headActions}>
            <a href="#enquire" className="gh-btn gh-btn--primary gh-btn--lg">
              Start a conversation
            </a>
          </div>
        </div>
      </section>

      <section className="gh-section">
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">What we do</span>
          <h2 className="gh-measure">Four things, done properly.</h2>
          <div className={styles.grid}>
            {OFFERS.map((o) => {
              const Icon = o.icon;
              return (
                <article key={o.title} className={`gh-card ${styles.card}`}>
                  <Icon size={24} className={styles.icon} />
                  <h3 className={styles.cardTitle}>{o.title}</h3>
                  <p className={styles.cardBody}>{o.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`gh-section ${styles.why}`}>
        <div className="gh-wrap">
          <div className={styles.whyGrid}>
            <div>
              <span className="gh-label gh-eyebrow">Why us</span>
              <h2>We have already built the hard version.</h2>
              <p className={styles.whyBody}>
                Geo Hound is not a demo. It is a published Chrome extension that detects
                dozens of service types across the web, runs real analysis in a browser, and
                drives it all from natural language. The awkward parts, the ones that eat a
                project, are already solved and in production.
              </p>
            </div>
            <ul className={styles.whyList}>
              <li>
                <CheckIcon size={16} />
                <span>
                  A working AI-to-GIS tool layer, {ASSISTANT_TOOL_COUNT} tools deep, that runs
                  analysis rather than describing it.
                </span>
              </li>
              <li>
                <CheckIcon size={16} />
                <span>
                  Deep familiarity with what real services do in the wild: OGC, Esri REST,
                  tiles, and the ways each of them misbehaves.
                </span>
              </li>
              <li>
                <CheckIcon size={16} />
                <span>
                  A GIS specialist doing the work, not a generalist agency learning geospatial
                  on your budget.
                </span>
              </li>
              <li>
                <CheckIcon size={16} />
                <span>
                  From MapScaping, which has spent years listening to this industry describe
                  its problems on the podcast.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="gh-section">
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">How it goes</span>
          <h2 className="gh-measure">Discovery call, fixed price, then we build.</h2>
          <ol className={styles.process}>
            {PROCESS.map((p) => (
              <li key={p.n} className={styles.step}>
                <span className={`gh-mono ${styles.stepNum}`}>{p.n}</span>
                <div>
                  <h3 className={styles.stepTitle}>{p.title}</h3>
                  <p className={styles.stepBody}>{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`gh-section ${styles.enquire}`} id="enquire">
        <div className={`gh-wrap ${styles.enquireGrid}`}>
          <div>
            <span className="gh-label gh-eyebrow">Enquire</span>
            <h2>Tell us what you are trying to do.</h2>
            <p className={styles.enquireBody}>
              A paragraph is plenty. If we are not the right people for it, we will say so and
              point you at someone who is.
            </p>
            <p className={styles.enquireNote}>
              We reply within two business days. If you would rather see the product first,
              it is <Link href="/pricing">free to install</Link>.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
