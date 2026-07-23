import type { Metadata } from 'next';
import Link from 'next/link';
import { InstallCta } from '@/components/InstallCta';
import { FlowSteps, type FlowStep } from '@/components/FlowSteps';
import { BuildingsIcon, CheckIcon } from '@/components/icons';
import {
  CREDIT_PACKS,
  CREDITS_PER_QUESTION,
  FREE_QUESTIONS_PER_MONTH,
  TEAM_PACKS,
  formatPrice,
  type CreditPack,
} from '@/lib/constants';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'How payment works',
  description:
    'The whole payment picture for Geo Hound: buying assistant credits, moving them to a new machine, and paying once for a whole team from a shared pool. Every flow, step by step.',
  alternates: { canonical: '/billing' },
};

/** Questions per dollar, rounded down. Matches the pricing page exactly. */
function perDollar(pack: CreditPack): string {
  return String(Math.floor((pack.questions / pack.price) * 10) / 10);
}

const BUY_FLOW: FlowStep[] = [
  {
    title: 'Open the assistant and choose a pack',
    body: 'In the workbench, open the Assistant tab, click Buy credits, and pick one of the packs.',
  },
  {
    title: 'Pay on Stripe',
    body: 'A Stripe-hosted checkout page opens in a new tab. You enter your card there. Geo Hound never sees your card details, and there is no account to create.',
  },
  {
    title: 'A confirmation email arrives',
    email: true,
    body: 'It names the email address your credits are anchored to. Keep it: that address is how you move your balance later.',
  },
  {
    title: 'Your credits are ready',
    done: true,
    body: 'The balance is added to your device and shows in the assistant. Ask your next question and the meter updates.',
  },
];

const RESTORE_FLOW: FlowStep[] = [
  {
    title: 'Choose Restore purchases',
    body: 'On the new machine or fresh install, open the Assistant tab, click Buy credits, then Restore purchases.',
  },
  {
    title: 'Enter your purchase email',
    body: 'Type the email you bought with and click Send code.',
  },
  {
    title: 'A six-digit code arrives',
    email: true,
    body: 'It expires in ten minutes. You get five attempts per code, and up to three codes an hour.',
  },
  {
    title: 'Enter the code',
    body: 'Type it in and click Restore.',
  },
  {
    title: 'Your balance moves across',
    done: true,
    body: 'The credits are moved onto this device, not copied. The old install is left empty, so a balance only ever lives in one place.',
  },
];

const CREATE_FLOW: FlowStep[] = [
  {
    title: 'Start a team',
    body: 'In the Assistant tab, open the Team section and choose Create a team. Enter a team name and your email.',
  },
  {
    title: 'Verify your email',
    email: true,
    body: 'A six-digit code arrives. Enter it to prove the address is yours. This becomes the team’s admin contact.',
  },
  {
    title: 'You are the admin, and you get a join code',
    done: true,
    body: 'The team is created and this device is its admin. A join code is shown once, so copy it now. Share it with the people you want on the team, then top up the pool.',
  },
];

const JOIN_FLOW: FlowStep[] = [
  {
    title: 'Get the join code from your admin',
    body: 'Whoever created the team sends you its join code, however they like: email, chat, in person.',
  },
  {
    title: 'Enter the code and your email',
    body: 'In the Assistant tab, open the Team section, choose Join a team, and enter the join code together with your email.',
  },
  {
    title: 'Verify your email',
    email: true,
    body: 'A six-digit code arrives. Enter it to confirm the address. This is what lets your admin see you on the member list.',
  },
  {
    title: 'You are on the team',
    done: true,
    body: 'Your questions now draw from the shared pool. The meter shows the team name and the pool balance instead of your personal one.',
  },
];

const TOPUP_FLOW: FlowStep[] = [
  {
    title: 'Buy a team pack',
    body: 'In the Team section, an admin picks one of the team packs below.',
  },
  {
    title: 'Pay on Stripe',
    body: 'A Stripe-hosted page opens in a new tab. Same as any purchase: no card details touch Geo Hound.',
  },
  {
    title: 'A confirmation email arrives',
    email: true,
    body: 'It names the team the credits were added to.',
  },
  {
    title: 'The pool is topped up',
    done: true,
    body: 'The credits land in the shared pool immediately. Every member can use them straight away, with nothing to install or restore.',
  },
];

const ADMIN_CAN = [
  'See the pool balance at any time.',
  'See every member: their email, when they joined, and how many questions they have asked this month.',
  'Remove a member by their email. Their questions stop drawing from the pool.',
  'Rotate the join code, which immediately stops the old one working. Useful if a code has spread too far.',
  'Buy top-ups whenever the pool runs low.',
] as const;

const ADMIN_LIMITS = [
  {
    t: 'You cannot remove yourself',
    b: 'There is no way to hand the admin role to someone else, so the admin stays the admin. Removing yourself would leave the team with no one able to manage it.',
  },
  {
    t: 'One team per device',
    b: 'A given install belongs to a single team at a time. Joining a second team replaces the first on that device.',
  },
  {
    t: 'Membership lives on the device',
    b: 'There is no login. If a member reinstalls or moves to a new machine, they simply join again with the code. Personal credit restore is for personal balances only, not team membership.',
  },
] as const;

export default function BillingPage() {
  return (
    <>
      <section className={`${styles.head} gh-graticule`}>
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">Billing</span>
          <h1>How payment works, start to finish.</h1>
          <p className={styles.lede}>
            Everything that finds and maps your data is free. The one thing you can pay for
            is the assistant, and you can pay for it on your own or once for a whole team.
            Here is exactly what happens in each case, including every email you will get.
          </p>
        </div>
      </section>

      {/* The model, in brief */}
      <section className="gh-section">
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">In short</span>
          <h2 className="gh-measure">The model before the flows.</h2>
          <div className={styles.facts}>
            <div className={`gh-card ${styles.fact}`}>
              <span className="gh-label">Free</span>
              <p>
                The detector and the workbench are free forever, with no account. The
                assistant gives everyone up to {FREE_QUESTIONS_PER_MONTH} free questions a
                month.
              </p>
            </div>
            <div className={`gh-card ${styles.fact}`}>
              <span className="gh-label">One credit, one question</span>
              <p>
                Past the free questions, {CREDITS_PER_QUESTION} credit is spent per question
                you ask. Whatever the assistant does to answer, however many tool steps, is
                free.
              </p>
            </div>
            <div className={`gh-card ${styles.fact}`}>
              <span className="gh-label">Buy once</span>
              <p>
                Credits are one-time purchases and never expire. There is no subscription and
                nothing to cancel. Full pack prices are on the{' '}
                <Link href="/pricing">pricing page</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Individual */}
      <section className={`gh-section ${styles.band}`}>
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">On your own</span>
          <h2 className="gh-measure">Paying for yourself.</h2>
          <p className={styles.sectionLede}>
            Your credits live on your device and are tied to the email you buy with. That
            email is what lets you carry the balance to a new machine.
          </p>
          <div className={styles.flows}>
            <FlowSteps label="Buying credits" steps={BUY_FLOW} />
            <FlowSteps label="Moving to a new machine" steps={RESTORE_FLOW} />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="gh-section">
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">As a team</span>
          <h2 className="gh-measure">
            <BuildingsIcon size={26} className={styles.h2Icon} /> One payment, a shared pool.
          </h2>
          <p className={styles.sectionLede}>
            A team is a shared prepaid pool of credits. One person pays, everyone draws from
            it. There is no per-seat billing and no subscription. When a member of a team asks
            a question, it comes out of the shared pool first, before their own free questions
            or any personal credits, so all the team&rsquo;s usage stays in one place. If the
            pool runs dry, they fall back to their personal free questions and can ask the
            admin to top it up.
          </p>

          {/* Team packs */}
          <div className={styles.packs}>
            {TEAM_PACKS.map((pack) => (
              <article
                key={pack.id}
                className={`gh-card ${styles.pack} ${pack.featured ? styles.packFeatured : ''}`}
              >
                {pack.featured ? <span className={styles.packFlag}>Best rate</span> : null}
                <p className={styles.packPrice}>{formatPrice(pack.price)}</p>
                <p className={styles.packQuestions}>{pack.questions.toLocaleString()} questions</p>
                <p className={styles.packUnit}>{perDollar(pack)} questions per dollar</p>
                <p className={styles.packNote}>
                  One-time purchase for the whole team. Credits never expire.
                </p>
              </article>
            ))}
          </div>
          <p className={styles.packsNote}>
            Team packs are bought inside the extension by the admin. Payment is handled by
            Stripe, the same way as personal packs. See the <Link href="/terms">terms of sale</Link>{' '}
            for the refund policy and seller identity.
          </p>

          {/* Team flows */}
          <div className={styles.flowsThree}>
            <FlowSteps label="Creating a team" steps={CREATE_FLOW} />
            <FlowSteps label="Joining a team" steps={JOIN_FLOW} />
            <FlowSteps label="Topping up the pool" steps={TOPUP_FLOW} />
          </div>
        </div>
      </section>

      {/* Admin */}
      <section className={`gh-section ${styles.band}`}>
        <div className="gh-wrap">
          <span className="gh-label gh-eyebrow">Being a team admin</span>
          <h2 className="gh-measure">What the admin can do, and cannot.</h2>
          <p className={styles.sectionLede}>
            The person who creates a team is its admin. The role lives on the device they
            created it from, recoverable through their team email.
          </p>
          <div className={styles.adminGrid}>
            <div className={`gh-card ${styles.adminCan}`}>
              <span className="gh-label">The admin can</span>
              <ul className={styles.canList}>
                {ADMIN_CAN.map((item) => (
                  <li key={item}>
                    <CheckIcon size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.limits}>
              {ADMIN_LIMITS.map((lim) => (
                <div key={lim.t} className={`gh-card ${styles.limit}`}>
                  <p className={styles.limitTitle}>{lim.t}</p>
                  <p className={styles.limitBody}>{lim.b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emails */}
      <section className="gh-section">
        <div className="gh-wrap gh-wrap--narrow" style={{ paddingInline: 0 }}>
          <span className="gh-label gh-eyebrow">The emails you will get</span>
          <h2>Every message, and why.</h2>
          <div className={styles.emails}>
            <div className={styles.email}>
              <p className={styles.emailTitle}>A six-digit verification code</p>
              <p className={styles.emailBody}>
                Sent when you create a team, join a team, or restore a purchase. Entering the
                code proves the address is yours. It expires in ten minutes, allows five
                attempts, and you can request at most three an hour.
              </p>
            </div>
            <div className={styles.email}>
              <p className={styles.emailTitle}>A purchase confirmation</p>
              <p className={styles.emailBody}>
                Sent after any payment. For a personal purchase it names the email your credits
                are anchored to, which is your lifeline for restoring later. For a team top-up
                it names the team the credits were added to.
              </p>
            </div>
            <div className={styles.email}>
              <p className={styles.emailTitle}>Never a password or login link</p>
              <p className={styles.emailBody}>
                There is no account and no login. If a message ever asks you for a password or
                sends you a sign-in link, it did not come from us.
              </p>
            </div>
          </div>

          <div className={styles.cta}>
            <InstallCta />
            <Link href="/pricing" className="gh-btn gh-btn--lg">
              See the pack prices
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
