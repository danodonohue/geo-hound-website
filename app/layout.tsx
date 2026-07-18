import type { Metadata } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { MAPSCALING_URL, SITE_URL } from '@/lib/constants';
import './globals.css';

/* Sitewide entity graph: the Organization that publishes Geo Hound and the
   WebSite itself. Establishes the brand as a known entity and links it to
   MapScaping. Emitted once, in the root, so every page carries it. */
const ORG_ID = `${SITE_URL}/#organization`;
const SITE_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'Geo Hound',
      url: SITE_URL,
      parentOrganization: { '@type': 'Organization', name: 'MapScaping', url: MAPSCALING_URL },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Geo Hound',
      url: SITE_URL,
      publisher: { '@id': ORG_ID },
      inLanguage: 'en',
    },
  ],
};

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
    'Chrome extension that detects the map services on any page as you browse, then maps, queries, and analyses them in your browser. No DevTools, no desktop GIS.',
  applicationName: 'Geo Hound',
  openGraph: {
    type: 'website',
    siteName: 'Geo Hound',
    locale: 'en',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* suppressHydrationWarning: the pre-paint script below sets data-theme on
       this element before React hydrates, so server and client markup
       legitimately differ here. */
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_GRAPH) }}
        />
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
