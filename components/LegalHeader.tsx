import { PRIVACY_LAST_UPDATED, TERMS_LAST_UPDATED } from '@/lib/constants';
import styles from './LegalHeader.module.css';

const CONFIG = {
  privacy: { label: 'Legal', title: 'Privacy policy', updated: PRIVACY_LAST_UPDATED },
  terms: { label: 'Legal', title: 'Terms of service and sale', updated: TERMS_LAST_UPDATED },
} as const;

/**
 * The branded strip over the legal documents. Deliberately plain: a header,
 * a title, a date. No marketing furniture on a page someone reads because
 * they need to know something specific.
 *
 * The date is a constant, not a build timestamp. A legal document's "last
 * updated" must change when its meaning changes, not when the site redeploys.
 */
export function LegalHeader({ kind }: { kind: keyof typeof CONFIG }) {
  const { label, title, updated } = CONFIG[kind];
  return (
    <header className={styles.head}>
      <span className="gh-label">{label}</span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.updated}>
        Last updated{' '}
        <time dateTime={updated} className="gh-mono">
          {updated}
        </time>
      </p>
    </header>
  );
}
