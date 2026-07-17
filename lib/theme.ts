/**
 * Theme wiring.
 *
 * Mirrors the extension's theme-init.js: the durable store is localStorage
 * under the key 'gh-theme', and tokens.css keys off [data-theme="dark"] on the
 * document element.
 *
 * One deliberate divergence from the extension, per the design brief: when no
 * explicit choice is stored, the site falls back to the operating system's
 * prefers-color-scheme. The extension always falls back to light. So a visitor
 * whose system is dark sees the dark site but the light extension until they
 * pick a theme in either surface. The brief asked for prefers-color-scheme
 * support; the extension does not implement it.
 */

export const THEME_STORAGE_KEY = 'gh-theme';

export type Theme = 'light' | 'dark';

/**
 * Runs blocking in <head> before first paint so there is no flash of the wrong
 * theme. Kept tiny and dependency-free, like the extension's version. Written
 * as a string because it must execute before React hydrates.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var t=localStorage.getItem(k);if(t!=='dark'&&t!=='light'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;
