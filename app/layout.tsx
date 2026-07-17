import type { Metadata } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { SITE_URL } from '@/lib/constants';
import './globals.css';

/* next/font downloads and self-hosts these at build time. Nothing is fetched
   from Google at runtime, per the brief. The variables are consumed by
   --gh-font and --gh-mono in globals.css. */

const sans = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-gh-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-gh-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Geo Hound: find the GIS data behind any web map',
    template: '%s | Geo Hound',
  },
  description:
    'Geo Hound is a Chrome extension that detects the map services on any page as you browse, then lets you map, query, and analyse them in your browser. No DevTools. No desktop GIS required.',
  openGraph: {
    type: 'website',
    siteName: 'Geo Hound',
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* suppressHydrationWarning: the pre-paint script below sets data-theme on
       this element before React hydrates, so server and client markup
       legitimately differ here. */
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="gh-skip">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
