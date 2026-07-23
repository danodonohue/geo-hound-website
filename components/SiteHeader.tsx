import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { InstallCta } from '@/components/InstallCta';
import { CrosshairIcon } from '@/components/icons';
import styles from './SiteHeader.module.css';

export const NAV = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/billing', label: 'Billing' },
  { href: '/services', label: 'Custom work' },
  { href: '/about', label: 'About' },
] as const;

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`gh-wrap ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Geo Hound home">
          <CrosshairIcon size={22} />
          <span className={styles.wordmark}>Geo Hound</span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          <InstallCta size="md" className={styles.headerCta} />

          {/* Narrow-screen navigation. Built on details/summary so it opens
              without JavaScript and stays keyboard operable. */}
          <details className={styles.menu}>
            <summary className={`gh-icon-btn ${styles.menuButton}`} aria-label="Open menu">
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <nav className={styles.menuPanel} aria-label="Main, narrow screen">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className={styles.menuLink}>
                  {item.label}
                </Link>
              ))}
              <Link href="/support" className={styles.menuLink}>
                Support
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
