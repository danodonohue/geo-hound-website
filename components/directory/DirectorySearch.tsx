'use client';
import { useState } from 'react';
import Link from 'next/link';
import index from '@/content/directory/index.json';
import styles from './directory.module.css';

type Entry = {
  slug: string;
  title: string;
  type: string;
  provider: string | null;
  place: { country: string; state: string | null } | null;
  themes: string[];
  description: string;
};

const MAX_RESULTS = 20;

/**
 * Search runs entirely in the browser over the committed index; there is no
 * search backend. The index ships only with pages that render this component.
 */
export function DirectorySearch() {
  const [q, setQ] = useState('');
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  const results = tokens.length === 0 ? [] : (index as Entry[]).filter((e) => {
    const hay = [e.title, e.provider, e.place?.country, e.place?.state,
      e.themes.join(' '), e.description, e.type].join(' ').toLowerCase();
    return tokens.every((t) => hay.includes(t));
  }).slice(0, MAX_RESULTS);

  return (
    <div className={styles.search}>
      <label className="gh-label" htmlFor="dir-search">Search the directory</label>
      <input
        id="dir-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Try: parcels, flood, WMS, New Zealand"
        className={styles.searchInput}
      />
      {tokens.length > 0 && results.length === 0 && (
        <p>Nothing matches that yet. The directory grows with every batch.</p>
      )}
      <ul className={styles.searchResults}>
        {results.map((e) => (
          <li key={e.slug}>
            <Link href={`/data/${e.slug}`} className={`gh-card ${styles.card}`}>
              <span className="gh-label">{e.type}</span>
              <strong>{e.title}</strong>
              <span>{e.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
