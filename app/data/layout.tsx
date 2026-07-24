import styles from './layout.module.css';

/**
 * Wraps every directory page: landing, datasheets, and hubs. Unlike guides,
 * this section is not a prose column; datasheets carry tables, grids, and
 * maps, so children get the full gh-wrap measure and manage their own
 * internal widths.
 */
export default function DataLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <div className="gh-wrap">{children}</div>
    </div>
  );
}
