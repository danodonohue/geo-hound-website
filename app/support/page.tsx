import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CHROME_EXTENSION_ID,
  CONTACT_EMAIL,
  EXTENSION_VERSION,
  SUPPORT_RESPONSE_DAYS,
} from '@/lib/constants';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Support',
  description:
    'Get help with Geo Hound: restore your credits on a new machine, fix a service that will not load, or contact us. We reply within two business days.',
  alternates: { canonical: '/support' },
};

const COMMON = [
  {
    q: 'I bought credits and they have not appeared',
    body: (
      <>
        Your credits are held against an identifier your browser generated, and anchored to
        your purchase email. If the purchase could not be matched to your install, the
        credits are waiting under that email. Follow the restore steps below and they will
        come across. Your balance also only refreshes after your next question, so ask
        something and check the pill.
      </>
    ),
  },
  {
    q: 'A service will not load in the workbench',
    body: (
      <>
        Almost always CORS: the service has not opted in to being read by a browser. Open the
        service&rsquo;s details in the popup and run the CORS test. If it says{' '}
        <code>Disabled</code>, nothing we can do will load it, and neither could any other
        browser app. Copy it for QGIS instead. The{' '}
        <Link href="/guides/why-wont-service-load-cors">full explanation is here</Link>.
      </>
    ),
  },
  {
    q: 'My layer only has some of the features',
    body: (
      <>
        Adding a layer fetches the features in your current map view, so you do not
        accidentally download a national dataset. If the server also capped the response, a{' '}
        <strong>Fetch all</strong> button appears on the layer card and pages through the
        whole thing. Do that before running analysis on everything.
      </>
    ),
  },
  {
    q: 'The extension is not detecting anything',
    body: (
      <>
        Check the site actually uses a GIS service: some maps are plain images. Check you have
        not silenced it under <strong>Settings</strong>, <strong>Disabled URLs</strong>. Note
        the big commercial basemaps (Google, Mapbox, and similar) are ignored on purpose.
        Reload the page after installing: the extension only sees requests made after it
        loaded.
      </>
    ),
  },
] as const;

export default function SupportPage() {
  return (
    <div className={styles.page}>
      <div className={`gh-wrap ${styles.inner}`}>
        <span className="gh-label gh-eyebrow">Support</span>
        <h1>Help with Geo Hound</h1>
        <p className={styles.lede}>
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and a person will
          reply, normally within {SUPPORT_RESPONSE_DAYS} business days. There is no ticket
          system and no bot.
        </p>

        <section className={`gh-card ${styles.restore}`}>
          <span className="gh-label">Most common request</span>
          <h2 className={styles.restoreTitle}>Moving your credits to a new machine</h2>
          <p className={styles.restoreBody}>
            Credits live against an identifier your browser generated, so a new computer, a
            new Chrome profile, or a fresh install starts with an empty balance. Your purchase
            email moves them across. You do not need us for this.
          </p>
          <ol className={styles.steps}>
            <li>Open the workbench and go to the Assistant tab.</li>
            <li>
              Click <strong>Buy credits</strong>, then <strong>Restore purchases</strong>.
            </li>
            <li>
              Enter the email you used at checkout and click <strong>Send code</strong>.
            </li>
            <li>Check your inbox for a six-digit code. It expires in ten minutes.</li>
            <li>
              Enter the code and click <strong>Restore</strong>. Your balance appears.
            </li>
          </ol>
          <p className={styles.restoreNote}>
            Five attempts per code, and up to three codes an hour. The confirmation message is
            the same whether or not that email has purchases, which stops strangers checking
            who has bought. Restoring moves your balance rather than copying it. If you have
            lost access to the purchase email, email us.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Before you email</h2>
          <div className={styles.list}>
            {COMMON.map((item) => (
              <div key={item.q} className={styles.item}>
                <p className={styles.q}>{item.q}</p>
                <p className={styles.a}>{item.body}</p>
              </div>
            ))}
          </div>
          <p className={styles.more}>
            More in the <Link href="/docs/faq">FAQ</Link>, the{' '}
            <Link href="/docs/detector">detector docs</Link>, the{' '}
            <Link href="/docs/workbench">workbench docs</Link>, and the{' '}
            <Link href="/docs/assistant">assistant docs</Link>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Reporting a problem</h2>
          <p className={styles.a}>
            Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. It helps enormously
            if you include the URL of the page you were on, what you expected, what happened,
            and your browser. If it is about a specific service, the service URL from the
            popup saves a round trip.
          </p>
          <dl className={styles.meta}>
            <div>
              <dt className="gh-label">Extension version</dt>
              <dd className="gh-mono">{EXTENSION_VERSION}</dd>
            </div>
            <div>
              <dt className="gh-label">Extension ID</dt>
              <dd className="gh-mono">{CHROME_EXTENSION_ID}</dd>
            </div>
            <div>
              <dt className="gh-label">Response time</dt>
              <dd className="gh-mono">{SUPPORT_RESPONSE_DAYS} business days</dd>
            </div>
          </dl>
        </section>

        <section className={styles.section}>
          <h2>Privacy and your data</h2>
          <p className={styles.a}>
            What Geo Hound collects and sends is set out in the{' '}
            <Link href="/privacy">privacy policy</Link>. To delete data held against your
            purchase, email us and we will remove it by hand. Everything else lives on your
            own machine: <strong>Clear All</strong> in the popup, <strong>New session</strong>{' '}
            in the workbench, or uninstalling removes it.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Custom work</h2>
          <p className={styles.a}>
            Want a chat interface on your own web map, or a custom GIS tool built? That is a
            different conversation: see <Link href="/services">custom work</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
