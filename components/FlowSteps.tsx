import type { ReactNode } from 'react';
import { CheckIcon, MailIcon } from '@/components/icons';
import styles from './FlowSteps.module.css';

export type FlowStep = {
  /** Short imperative title for the step. */
  title: string;
  /** What happens, in one or two plain sentences. */
  body: ReactNode;
  /** Marks a step where something lands in the user's inbox. */
  email?: boolean;
  /** Marks the terminal step, the outcome the flow arrives at. */
  done?: boolean;
};

type Props = {
  /** Mono micro-label above the flow, e.g. "Buying credits". */
  label: string;
  steps: FlowStep[];
};

/**
 * A single flow rendered as a vertical sequence: numbered ink nodes joined by a
 * hairline, one step per row. Deliberately not a boxes-and-arrows diagram: the
 * connected column reads as a flow while staying inside the site's border-and-
 * hairline idiom. Email steps and the terminal outcome get distinct nodes so a
 * reader can see at a glance where a message arrives and where the flow lands.
 */
export function FlowSteps({ label, steps }: Props) {
  return (
    <div className={styles.flow}>
      <span className="gh-label">{label}</span>
      <ol className={styles.list}>
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={`${styles.step} ${step.done ? styles.stepDone : ''}`}
          >
            <span
              className={`${styles.node} ${step.email ? styles.nodeEmail : ''} ${
                step.done ? styles.nodeDone : ''
              }`}
              aria-hidden="true"
            >
              {step.done ? (
                <CheckIcon size={17} />
              ) : step.email ? (
                <MailIcon size={16} />
              ) : (
                <span className={styles.num}>{i + 1}</span>
              )}
            </span>
            <div className={styles.content}>
              <p className={styles.title}>
                {step.title}
                {step.email ? <span className={styles.tag}>Email</span> : null}
              </p>
              <p className={styles.body}>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
