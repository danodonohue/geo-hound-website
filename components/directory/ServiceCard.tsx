import Link from 'next/link';
import type { DirectoryService } from '@/lib/directory';
import styles from './directory.module.css';

export function ServiceCard({ service }: { service: DirectoryService }) {
  return (
    <Link href={`/data/${service.slug}`} className={`gh-card ${styles.card}`}>
      <span className="gh-label">{service.type}</span>
      <strong>{service.title}</strong>
      {service.provider && <span className={styles.cardMeta}>{service.provider}</span>}
      <span>{service.description}</span>
      <span className={styles.cardMeta}>
        {[
          service.place ? (service.place.state ? `${service.place.state}, ${service.place.country}` : service.place.country) : null,
          ...service.themes.map((t) => t.name.replace(/-/g, ' ')),
        ].filter(Boolean).join(' | ')}
      </span>
    </Link>
  );
}
