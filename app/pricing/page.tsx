import type { Metadata } from 'next';
import Link from 'next/link';
import { InstallCta } from '@/components/InstallCta';
import { CheckIcon } from '@/components/icons';
import {
  ASSISTANT_TOOL_COUNT,
  CREDIT_PACKS,
  CREDITS_PER_QUESTION,
  FREE_QUESTIONS_PER_MONTH,
  formatPrice,
  type CreditPack,
} from '@/lib/constants';
import { SERVICE_TYPE_COUNT } from '@/lib/content';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Pricing',
  description: `Geo Hound is free to install. The detector and workbench are free forever. The assistant gives you ${FREE_QUESTIONS_PER_MONTH} free questions a month, then credit packs from ${formatPrice(CREDIT_PACKS[0].price)}. Pay once, credits never expire.`,
  alternates: { canonical: '/pricing' },
};

/**
 * Questions per dollar, rounded down to one decimal and trimmed.
 *
 * Rounds DOWN deliberately: 550/20 is 27.5, and this audience checks the
 * arithmetic. Never advertise a rate the pack does not actually deliver.
 */
function perDollar(pack: CreditPack): string {
  const rate = Math.floor((pack.questions / pack.price) * 10) / 10;
  return String(rate);
}

/* Pricing FAQ. Repeats the credit questions per the brief. Also the source for
   the FAQPage structured data below, so the two cannot disagree. */
const FAQ = [
  {
    q: 'Do credits expire?',
    a: 'No. Credit packs are a one-time purchase and the balance stays on your account until you use it. There is no subscription and no monthly reset on purchased credits.',
  },
  {
    q: 'What exactly costs a credit?',
    a: `The question you send. ${CREDITS_PER_QUESTION} credit is deducted per question. Whatever the assistant then does to answer it, whether that is one tool step or eight, is free.`,
  },
  {
    q: `What happens after my ${FREE_QUESTIONS_PER_MONTH} free questions?`,
    a: 'The detector and the workbench keep working exactly as before, because they are free and do not use credits. Only the assistant pauses until your free questions reset the following month or you buy a pack.',
  },
  {
    q: 'How do I move my credits to another machine?',
    a: 'Enter the email you purchased with, and we send a six-digit code. Enter the code in the new install and your balance moves across. It works the same after a reinstall.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Yes, full refunds only. Refunding a pack removes the credits it granted from your balance. The details are in the terms of sale.',
  },
  {
    q: 'Who am I actually buying from?',
    a: 'Payments are processed by Stripe, and the developer is the seller, not Google. Geo Hound never sees your card details. The seller identity is stated in the terms.',
  },
] as const;

function StructuredData() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function PricingPage() {
  return (
    <>
      <StructuredData />

      <section className={`${styles.head} gh-graticule`}>
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">Pricing</span>
          <h1>Free to install. Pay once, if you ever need to.</h1>
          <p className={styles.lede}>
            Everything that finds and maps your data is free, with no account and no time
            limit. The only thing you can pay for is the assistant, and only when you have
            used up the free questions everyone gets.
          </p>
        </div>
      </section>

      {/* The two free tiers */}
      <section className="gh-section">
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">Free</span>
          <h2 className="gh-measure">What you get without paying anything.</h2>

          <div className={styles.tiers}>
            <article className={`gh-card ${styles.tier}`}>
              <span className="gh-label">Detector and workbench</span>
              <p className={styles.tierPrice}>Free</p>
              <p className={styles.tierQualifier}>Forever. No account required.</p>
              <ul className={styles.list}>
                <li>
                  <CheckIcon size={16} />
                  <span>Automatic detection of {SERVICE_TYPE_COUNT} service and file types as you browse.</span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>Saved services with metadata, folders, and search.</span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>CORS tests, and URLs pre-formatted for QGIS and ArcGIS Pro.</span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>The full workbench: layers, attribute table, filter builder, selection.</span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>Buffer, spatial join, nearest distance, overlays, field calculator.</span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>Symbology, labels, annotations, and every export format.</span>
                </li>
              </ul>
            </article>

            <article className={`gh-card ${styles.tier}`}>
              <span className="gh-label">Assistant, free tier</span>
              <p className={styles.tierPrice}>{FREE_QUESTIONS_PER_MONTH} questions</p>
              <p className={styles.tierQualifier}>Every month, for everyone.</p>
              <ul className={styles.list}>
                <li>
                  <CheckIcon size={16} />
                  <span>Ask for analysis in plain English, inside the workbench.</span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>
                    The same {ASSISTANT_TOOL_COUNT} tools the paid tier uses. Nothing is held
                    back.
                  </span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>Resets each month whether or not you have bought credits.</span>
                </li>
                <li>
                  <CheckIcon size={16} />
                  <span>Free questions are used before any credits you have bought.</span>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Credit packs */}
      <section className="gh-section">
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">Credit packs</span>
          <h2 className="gh-measure">
            Need more than {FREE_QUESTIONS_PER_MONTH} questions? Buy a pack once.
          </h2>

          <div className={styles.packs}>
            {CREDIT_PACKS.map((pack) => (
              <article
                key={pack.id}
                className={`gh-card ${styles.pack} ${pack.featured ? styles.packFeatured : ''}`}
              >
                {pack.featured ? <span className={styles.packFlag}>Recommended</span> : null}
                <p className={styles.packPrice}>{formatPrice(pack.price)}</p>
                <p className={styles.packQuestions}>{pack.questions} questions</p>
                <p className={styles.packUnit}>{perDollar(pack)} questions per dollar</p>
                <p className={styles.packNote}>
                  One-time purchase. Credits never expire and there is nothing to cancel.
                </p>
              </article>
            ))}
          </div>

          <p className="gh-muted" style={{ marginTop: 26, fontSize: 14, maxWidth: '70ch' }}>
            Packs are bought inside the extension, in the assistant tab. Payment is handled by
            Stripe. Geo Hound never sees your card details. See the{' '}
            <Link href="/terms">terms of sale</Link> for the refund policy and the seller
            identity.
          </p>
        </div>
      </section>

      {/* How credits work */}
      <section className={`gh-section ${styles.mechanics}`}>
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">How credits work</span>
          <h2 className="gh-measure">The whole model, in four rules.</h2>

          <div className={styles.mechanicsGrid}>
            <div className={`gh-card ${styles.rule}`}>
              <span className="gh-label">Rule 1</span>
              <h3 style={{ fontSize: '0.9375rem' }}>
                {CREDITS_PER_QUESTION} credit is {CREDITS_PER_QUESTION} question
              </h3>
              <p className={styles.ruleBody}>
                You are charged for the question you type, not for the work it causes. If the
                assistant runs eight tool steps to answer you, those steps are free.
              </p>
            </div>

            <div className={`gh-card ${styles.rule}`}>
              <span className="gh-label">Rule 2</span>
              <h3 style={{ fontSize: '0.9375rem' }}>Credits never expire</h3>
              <p className={styles.ruleBody}>
                A pack is a one-time purchase. There is no subscription, no renewal, and no
                date by which you have to use the balance.
              </p>
            </div>

            <div className={`gh-card ${styles.rule}`}>
              <span className="gh-label">Rule 3</span>
              <h3 style={{ fontSize: '0.9375rem' }}>Free questions come first</h3>
              <p className={styles.ruleBody}>
                Your {FREE_QUESTIONS_PER_MONTH} free questions are spent before any credits
                you have bought, so buying a pack never costs you the free tier.
              </p>
            </div>

            <div className={`gh-card ${styles.rule}`}>
              <span className="gh-label">Rule 4</span>
              <h3 style={{ fontSize: '0.9375rem' }}>Your balance follows you</h3>
              <p className={styles.ruleBody}>
                New machine or fresh install: enter your purchase email, get a six-digit code,
                and the balance moves across. Walked through on{' '}
                <Link href="/support">the support page</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="gh-section">
        <div className="gh-wrap gh-wrap--narrow" style={{ paddingInline: 0 }}>
          <span className="gh-label gh-eyebrow">Questions</span>
          <h2>Credits, refunds, and the fine print.</h2>
          <div className={styles.faq}>
            {FAQ.map((item) => (
              <div key={item.q} className={styles.faqItem}>
                <p className={styles.faqQ}>{item.q}</p>
                <p className={styles.faqA}>{item.a}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <InstallCta />
            <Link href="/docs/assistant" className="gh-btn gh-btn--lg">
              See what the assistant can do
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
