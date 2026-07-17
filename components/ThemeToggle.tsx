'use client';

import { useEffect, useState } from 'react';
import { THEME_STORAGE_KEY, type Theme } from '@/lib/theme';
import { MoonIcon, SunIcon } from '@/components/icons';

/**
 * Manual theme toggle, persisted to localStorage under the same key the
 * extension uses. The pre-paint script in the document head has already set
 * data-theme by the time this mounts; this component reads that back rather
 * than deciding the theme itself, so the two can never disagree.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === 'dark' ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage blocked: the toggle still works for this page view */
    }
  }

  /* Render a stable, correctly sized shell until mounted. Guessing the icon
     before reading the DOM would flash the wrong one on hydration. */
  const label =
    theme === null
      ? 'Switch theme'
      : theme === 'dark'
        ? 'Switch to light theme'
        : 'Switch to dark theme';

  return (
    <button
      type="button"
      className="gh-icon-btn"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
    </button>
  );
}
