import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { themeHubs } from '@/lib/directory';
import { ServiceCard } from '@/components/directory/ServiceCard';
import styles from '../../hub.module.css';

export function generateStaticParams() {
  return themeHubs().map((h) => ({ theme: h.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: {
  params: Promise<{ theme: string }>;
}): Promise<Metadata> {
  const { theme } = await params;
  const hub = themeHubs().find((h) => h.slug === theme);
  if (!hub) return {};
  return {
    title: `${hub.label} GIS services and data`,
    description: `${hub.services.length} live mapping services about ${hub.label.toLowerCase()}, each with layers, fields, and connection instructions for QGIS and ArcGIS Pro.`,
    alternates: { canonical: `/data/theme/${theme}` },
  };
}

export default async function ThemeHub({ params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  const hub = themeHubs().find((h) => h.slug === theme);
  if (!hub) notFound();
  return (
    <>
      <span className="gh-label gh-eyebrow">Data directory</span>
      <h1>{hub.label} services</h1>
      <p className={styles.lede}>
        Live services about {hub.label.toLowerCase()}, found by Geo Hound users
        and documented with layers, fields, and connection instructions.
      </p>
      <ul className={styles.grid}>
        {hub.services.map((s) => (
          <li key={s.slug}><ServiceCard service={s} /></li>
        ))}
      </ul>
    </>
  );
}
