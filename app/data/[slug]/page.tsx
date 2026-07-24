import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllServices, getService, relatedTo, type DirectoryService } from '@/lib/directory';
import { SITE_URL, CONTACT_EMAIL } from '@/lib/constants';
import { ExtentMap } from '@/components/directory/ExtentMap';
import { LivePreview } from '@/components/directory/LivePreview';
import { ConnectSnippets } from '@/components/directory/ConnectSnippets';
import { CopyButton } from '@/components/directory/CopyButton';
import { InstallCta } from '@/components/InstallCta';
import shared from '@/components/directory/directory.module.css';
import styles from './service.module.css';

export function generateStaticParams() {
  return getAllServices().map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: `${s.title}: live ${s.type} datasheet`,
    description: s.description,
    alternates: { canonical: `/data/${s.slug}` },
  };
}

/* Preview policy: tile and image endpoints load as plain images, which the
   browser allows from any origin. Vector endpoints need fetch, so they are
   only previewable when the server sends CORS headers. */
const PREVIEWABLE_ALWAYS = new Set(['OGC WMS', 'XYZ Tiles', 'ESRI MapServer', 'ESRI ImageServer']);

function canPreview(s: DirectoryService): boolean {
  if (PREVIEWABLE_ALWAYS.has(s.type)) return true;
  return (s.type === 'ESRI FeatureServer' || s.type === 'OGC WFS') && s.cors_enabled === true;
}

function firstVectorLayer(s: DirectoryService) {
  return s.layers[0];
}

function StructuredData({ s }: { s: DirectoryService }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: s.title,
    description: s.description,
    url: `${SITE_URL}/data/${s.slug}`,
    ...(s.provider ? { creator: { '@type': 'Organization', name: s.provider } } : {}),
    distribution: { '@type': 'DataDownload', contentUrl: s.url },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
  );
}

const VISIBLE_LAYER_ROWS = 15;

function LayerRows({ layers }: { layers: DirectoryService['layers'] }) {
  return (
    <>
      {layers.map((l) => (
        <tr key={String(l.id)} id={`layer-${l.id}`}>
          <td className={shared.mono}>{String(l.id)}</td>
          <td>
            {l.title ?? l.name}
            {l.fields.length > 0 && (
              <details>
                <summary>{l.fields.length} fields</summary>
                <table className={`${shared.layerTable} ${shared.fieldTable}`}>
                  <thead>
                    <tr><th>Name</th><th>Alias</th><th>Type</th></tr>
                  </thead>
                  <tbody>
                    {l.fields.map((f) => (
                      <tr key={f.name}>
                        <td className={shared.mono}>{f.name}</td>
                        <td>{f.alias ?? ''}</td>
                        <td className={shared.mono}>{f.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            )}
          </td>
          <td>{l.geometry ?? ''}</td>
          <td>{l.feature_count != null ? l.feature_count.toLocaleString('en') : ''}</td>
        </tr>
      ))}
    </>
  );
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const related = relatedTo(s);
  const layer = firstVectorLayer(s);
  const relatedGroups = [
    { heading: 'Same provider', items: related.provider },
    { heading: 'Same place', items: related.place },
    { heading: 'Same theme', items: related.theme },
  ].filter((g) => g.items.length > 0);

  return (
    <>
      <StructuredData s={s} />
      <div className={styles.eyebrowRow}>
        <span className="gh-label gh-eyebrow">{s.type}</span>
        <Link href="/data" className="gh-label">Data directory</Link>
      </div>
      <h1>{s.title}</h1>
      {s.provider && <p className={styles.providerLine}>Published by {s.provider}</p>}
      <p>{s.description}</p>
      <div className={styles.tags}>
        {s.place && s.place.confidence !== 'low' && (
          <span className={styles.tag}>
            {s.place.state ? `${s.place.state}, ${s.place.country}` : s.place.country}
          </span>
        )}
        {s.themes.filter((t) => t.confidence !== 'low').map((t) => (
          <span key={t.name} className={styles.tag}>{t.name.replace(/-/g, ' ')}</span>
        ))}
      </div>

      <div className={styles.mapRow}>
        <ExtentMap bbox={s.bbox} title={s.title} />
        {canPreview(s) ? (
          <LivePreview
            url={s.url}
            type={s.type}
            bbox={s.bbox}
            layerName={layer?.name}
            layerId={layer?.id}
          />
        ) : (
          <p className={shared.previewNote}>
            Live preview is not available: this server does not send CORS headers.
            The QGIS connection below works regardless.
          </p>
        )}
      </div>

      <section className={styles.section}>
        <h2>Service facts</h2>
        <div className="gh-card">
          <dl className={shared.facts}>
            <dt>Endpoint</dt>
            <dd>
              <span className={styles.eyebrowRow}>
                <span className={shared.mono}>{s.url}</span>
                <CopyButton text={s.url} label="Copy URL" />
              </span>
            </dd>
            <dt>Type</dt>
            <dd>{s.type}</dd>
            <dt>Layers</dt>
            <dd>{s.layers.length}</dd>
            {s.formats.length > 0 && (<><dt>Formats</dt><dd>{s.formats.join(', ')}</dd></>)}
            {s.crs.length > 0 && (<><dt>CRS</dt><dd className={shared.mono}>{s.crs.join(', ')}</dd></>)}
            <dt>CORS</dt>
            <dd>{s.cors_enabled === true ? 'Enabled' : s.cors_enabled === false ? 'Not enabled' : 'Not tested'}</dd>
            {s.response_ms != null && (<><dt>Response time</dt><dd>{s.response_ms} ms at last check</dd></>)}
            <dt>Last verified</dt>
            <dd>{s.last_verified}</dd>
            <dt>Discovered</dt>
            <dd>{s.discovery_count} {s.discovery_count === 1 ? 'time' : 'times'} by Geo Hound users</dd>
          </dl>
        </div>
      </section>

      {s.layers.length > 0 && (
        <section className={styles.section}>
          <h2>Layers</h2>
          <table className={shared.layerTable}>
            <thead>
              <tr><th>Id</th><th>Layer</th><th>Geometry</th><th>Features</th></tr>
            </thead>
            <tbody>
              <LayerRows layers={s.layers.slice(0, VISIBLE_LAYER_ROWS)} />
            </tbody>
          </table>
          {s.layers.length > VISIBLE_LAYER_ROWS && (
            <details>
              <summary>All {s.layers.length} layers</summary>
              <table className={shared.layerTable}>
                <tbody>
                  <LayerRows layers={s.layers.slice(VISIBLE_LAYER_ROWS)} />
                </tbody>
              </table>
            </details>
          )}
        </section>
      )}

      <section className={styles.section}>
        <h2>Use this service</h2>
        <div className={styles.snippetGrid}>
          <ConnectSnippets service={s} />
        </div>
      </section>

      {relatedGroups.length > 0 && (
        <section className={styles.section}>
          <h2>Related services</h2>
          <ul className={styles.relatedGrid}>
            {relatedGroups.flatMap((g) =>
              g.items.map((r) => (
                <li key={`${g.heading}-${r.slug}`}>
                  <Link href={`/data/${r.slug}`} className={`gh-card ${shared.card}`}>
                    <span className="gh-label">{g.heading}</span>
                    <strong>{r.title}</strong>
                    <span className={shared.cardMeta}>{r.type}</span>
                  </Link>
                </li>
              )),
            )}
          </ul>
        </section>
      )}

      <div className={styles.footerStrip}>
        <div>
          <p>This service was found in the wild by Geo Hound users while browsing the web.</p>
          <InstallCta size="md" />
        </div>
        <a
          className={styles.reportLink}
          href={`mailto:${CONTACT_EMAIL}?subject=Directory listing: ${s.slug}`}
        >
          Report an issue with this listing
        </a>
      </div>
    </>
  );
}
