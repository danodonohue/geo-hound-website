import styles from './layout.module.css';

/**
 * Wraps every guide, including the hub. MDX children render into .gh-prose,
 * so an .mdx file is pure prose with no layout concerns of its own.
 */
export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={`gh-wrap ${styles.inner}`}>
        <article className="gh-prose">{children}</article>
      </div>
    </div>
  );
}
