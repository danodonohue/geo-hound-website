import styles from './layout.module.css';

/**
 * Shell for the legal documents.
 *
 * A route group, so /privacy and /terms keep their exact URLs. Those two must
 * never move: the Chrome Web Store listing points at them, and a submitted
 * privacy-policy URL is expected to be stable forever.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={`gh-wrap ${styles.inner}`}>
        <article className="gh-prose">{children}</article>
      </div>
    </div>
  );
}
