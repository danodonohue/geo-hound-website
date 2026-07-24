import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { placeHubs } from '@/lib/directory';
import { ServiceCard } from '@/components/directory/ServiceCard';
import styles from '../../hub.module.css';

export function generateStaticParams() {
  return placeHubs().map((h) => ({ place: h.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: {
  params: Promise<{ place: string }>;
}): Promise<Metadata> {
  const { place } = await params;
  const hub = placeHubs().find((h) => h.slug === place);
  if (!hub) return {};
  return {
    title: `GIS services covering ${hub.label}`,
    description: `${hub.services.length} live mapping services covering ${hub.label}: WMS, ArcGIS REST, and more, each with layers, fields, and connection instructions.`,
    alternates: { canonical: `/data/place/${place}` },
  };
}

export default async function PlaceHub({ params }: { params: Promise<{ place: string }> }) {
  const { place } = await params;
  const hub = placeHubs().find((h) => h.slug === place);
  if (!hub) notFound();
  return (
    <>
      <span className="gh-label gh-eyebrow">Data directory</span>
      <h1>GIS services covering {hub.label}</h1>
      <p className={styles.lede}>
        Every service below was found by Geo Hound users, verified alive, and
        documented with its layers, fields, and connection instructions.
      </p>
      <ul className={styles.grid}>
        {hub.services.map((s) => (
          <li key={s.slug}><ServiceCard service={s} /></li>
        ))}
      </ul>
    </>
  );
}
