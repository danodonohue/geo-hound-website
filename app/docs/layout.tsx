import Link from 'next/link';
import styles from './layout.module.css';

const DOCS_NAV = [
  { href: '/how-it-works', label: 'Overview' },
  { href: '/docs/detector', label: 'Detector' },
  { href: '/docs/workbench', label: 'Workbench' },
  { href: '/docs/assistant', label: 'Assistant' },
  { href: '/docs/faq', label: 'FAQ' },
] as const;

/**
 * Docs shell. A persistent side nav on wide screens so the four pages read as
 * one manual, and MDX children render into .gh-prose.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={`gh-wrap ${styles.grid}`}>
        <nav className={styles.side} aria-label="Documentation">
          <p className="gh-label">Documentation</p>
          <ul className={styles.list}>
            {DOCS_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="gh-prose">{children}</article>
      </div>
    </div>
  );
}
