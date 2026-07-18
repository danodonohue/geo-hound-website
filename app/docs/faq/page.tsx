import type { Metadata } from 'next';
import Link from 'next/link';
import { GuideFooter } from '@/components/GuideFooter';
import { FREE_QUESTIONS_PER_MONTH } from '@/lib/constants';
import styles from './faq.module.css';

export const metadata: Metadata = {
  title: 'Frequently asked questions',
  description:
    'Does Geo Hound slow browsing? Why read all websites? Where is my data stored? Do credits expire? Does it work in Edge or Brave? Answered honestly.',
  alternates: { canonical: '/docs/faq' },
};

/**
 * FAQ content. Answers are JSX so they can link, which matters for the
 * internal link graph, and the structured data below strips the markup by
 * carrying a separate plain-text answer.
 *
 * Both fields must say the same thing. If you edit one, edit the other:
 * shipping structured data that disagrees with the visible page is exactly
 * what search engines penalise.
 */
type FaqItem = {
  q: string;
  /** Plain text, for the FAQPage markup. */
  text: string;
  body: React.ReactNode;
};

const FAQ: FaqItem[] = [
  {
    q: 'Does it slow my browsing down?',
    text: 'No. Geo Hound watches the URLs of requests your browser has already finished, and scans the page for links to geospatial files. It does not intercept, delay, or modify any request, so it cannot slow a page down. It never reads request or response bodies, and what it scans on the page is discarded immediately unless it identifies a service or file.',
    body: (
      <>
        No. Geo Hound watches the URLs of requests your browser has <em>already finished</em>,
        and scans the page for links to geospatial files. It does not intercept, delay, or
        modify any request, so it cannot slow a page down. It never reads request or response
        bodies, and what it scans on the page is discarded immediately unless it identifies a
        service or file.
      </>
    ),
  },
  {
    q: 'Why does it need to read data on all websites?',
    text: 'Because GIS services live on arbitrary domains: a council, a ministry, a utility, a university. There is no list to permit in advance, so the extension has to be able to observe requests on any site, read the page for file links, and fetch service metadata from any host. Detection is passive: it keeps the URLs that are GIS services or geospatial files and discards everything else within about two seconds. Nothing is sold and nobody is profiled.',
    body: (
      <>
        Because GIS services live on arbitrary domains: a council, a ministry, a utility, a
        university. There is no list to permit in advance, so the extension has to be able to
        observe requests on any site, read the page for file links, and fetch service metadata
        from any host. Detection is passive: it keeps the URLs that are GIS services or
        geospatial files and discards everything else within about two seconds. Nothing is
        sold and nobody is profiled. The{' '}
        <Link href="/privacy">privacy policy</Link> spells out exactly what is inspected.
      </>
    ),
  },
  {
    q: 'Does it work on private or logged-in maps?',
    text: 'It detects whatever your browser loads, so a map behind a login is detected like any other. Geo Hound does not bypass authentication and adds no credentials of its own. A service that needed your session to load will still need it later, and services that require authentication are never submitted to the shared directory. Whether you may use the data is between you and whoever published it.',
    body: (
      <>
        It detects whatever your browser loads, so a map behind a login is detected like any
        other. Geo Hound does not bypass authentication and adds no credentials of its own. A
        service that needed your session to load will still need it later, and services that
        require authentication are never submitted to the shared directory. Whether you may
        use the data is between you and whoever published it: check their terms.
      </>
    ),
  },
  {
    q: 'Where is my data stored?',
    text: 'On your machine. Detected services, folders, notes, imported files, and your workbench session all live in your browser local storage and are never uploaded. Nothing syncs to your Google account. The exceptions are the public metadata of services submitted to the shared directory, which carries no identifier of yours, and anything you send the assistant.',
    body: (
      <>
        On your machine. Detected services, folders, notes, imported files, and your workbench
        session all live in your browser&rsquo;s local storage and are never uploaded. Nothing
        syncs to your Google account. The exceptions are the public metadata of services
        submitted to the shared directory, which carries no identifier of yours, and anything
        you send the <Link href="/docs/assistant">assistant</Link>.
      </>
    ),
  },
  {
    q: 'What happens when I hit 500 saved services?',
    text: 'The oldest auto-detected services are trimmed to make room, quietly, and can be found again if you revisit the site. Services you have filed into your own folders are never trimmed. If a service matters to you, put it in a folder.',
    body: (
      <>
        The oldest auto-detected services are trimmed to make room, quietly, and can be found
        again if you revisit the site. <strong>Services you have filed into your own folders
        are never trimmed.</strong> If a service matters to you, put it in a folder.
      </>
    ),
  },
  {
    q: 'Do credits expire?',
    text: 'No. Credit packs are a one-time purchase and the balance stays until you spend it. There is no subscription and nothing renews.',
    body: (
      <>
        No. Credit packs are a one-time purchase and the balance stays until you spend it.
        There is no subscription and nothing renews. See <Link href="/pricing">pricing</Link>.
      </>
    ),
  },
  {
    q: 'Can I get a refund?',
    text: 'Yes, full refunds. Refunding a pack removes the credits it granted from your balance. If you have already spent some, your balance goes to zero rather than negative, and you are not billed for the difference. The terms cover this in full.',
    body: (
      <>
        Yes, full refunds. Refunding a pack removes the credits it granted from your balance.
        If you have already spent some, your balance goes to zero rather than negative, and
        you are not billed for the difference. The <Link href="/terms">terms of sale</Link>{' '}
        cover this in full.
      </>
    ),
  },
  {
    q: 'Is my analysis private?',
    text: 'The detector and the workbench are entirely local: nothing you map, filter, select, or analyse leaves your browser. The assistant is the exception, and only with your consent. It sends layer schemas, counts, and small capped samples, never geometry or whole datasets, and conversations are not stored on our servers.',
    body: (
      <>
        The detector and the workbench are entirely local: nothing you map, filter, select, or
        analyse leaves your browser. The assistant is the exception, and only after you
        consent. It sends layer schemas, counts, and small capped samples, never geometry or
        whole datasets, and conversations are not stored on our servers. Details in the{' '}
        <Link href="/privacy">privacy policy</Link>.
      </>
    ),
  },
  {
    q: 'Does it work in Edge or Brave?',
    text: 'Geo Hound is built and tested for Chrome and distributed through the Chrome Web Store. Edge and Brave are built on Chromium and can install Chrome Web Store extensions, so it generally works, but those browsers are not tested and are not supported. Firefox is not supported.',
    body: (
      <>
        Geo Hound is built and tested for Chrome, and distributed through the Chrome Web
        Store. Edge and Brave are built on Chromium and can install Chrome Web Store
        extensions, so it generally works there, but they are not tested and not supported. If
        something breaks in one of them, please <Link href="/support">tell us</Link> and we
        will look, but Chrome is what we guarantee. Firefox is not supported.
      </>
    ),
  },
  {
    q: 'A service will not load in the workbench. Why?',
    text: 'Usually CORS. A service can work in QGIS and still refuse to load in a browser, because browsers require the server to opt in with a header. Run the CORS test on the service card: if it says Disabled, the service is not usable from a browser app, and the fix has to come from whoever runs it. Use the copy-for-QGIS button instead.',
    body: (
      <>
        Usually CORS. A service can work in QGIS and still refuse to load in a browser,
        because browsers require the server to opt in with a header. Run the CORS test on the
        service card: if it says <code>Disabled</code>, that service is not usable from a
        browser app and the fix has to come from whoever runs it. Copy it for QGIS instead.
        There is a{' '}
        <Link href="/guides/why-wont-service-load-cors">longer explanation here</Link>.
      </>
    ),
  },
  {
    q: 'Why does it only load features for my current view?',
    text: 'To avoid pulling an entire national dataset because you glanced at a map. Adding a vector layer fetches the features in your current view. If a layer is truncated by the server per-request cap, a Fetch all button appears on its card to page through the whole dataset, which is what you want before analysing everything.',
    body: (
      <>
        To avoid pulling an entire national dataset because you glanced at a map. Adding a
        vector layer fetches the features in your current view. If the server caps the
        response, a <strong>Fetch all</strong> button appears on the card to page through the
        whole dataset, which is what you want before analysing everything. See the{' '}
        <Link href="/docs/workbench">workbench docs</Link>.
      </>
    ),
  },
  {
    q: 'Is there an account?',
    text: 'No. There is no login, no password, and no sign-up. You are identified only by a random identifier your browser generates. That is also why buying credits records your email: it is the only way to move a balance to a new machine.',
    body: (
      <>
        No. There is no login, no password, and no sign-up. You are identified only by a
        random identifier your browser generates locally. That is also why buying credits
        records your email: it is the only way to move a balance to a new machine, via{' '}
        <Link href="/docs/assistant">restore</Link>.
      </>
    ),
  },
];

function StructuredData() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.text },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function FaqPage() {
  return (
    <>
      <StructuredData />
      <span className="gh-label gh-eyebrow">Documentation</span>
      <h1>Frequently asked questions</h1>
      <p>
        Short answers. Everything here is what the extension actually does, not what would
        sound best. The {FREE_QUESTIONS_PER_MONTH}-free-questions figure and the credit
        rules are covered on <Link href="/pricing">pricing</Link>.
      </p>

      <div className={styles.list}>
        {FAQ.map((item) => (
          <section key={item.q} className={styles.item}>
            <h2 className={styles.q}>{item.q}</h2>
            <p className={styles.a}>{item.body}</p>
          </section>
        ))}
      </div>

      <GuideFooter slug="extract-gis-data-from-website" />
    </>
  );
}
