import { ImageResponse } from 'next/og';

/**
 * Shared OpenGraph / Twitter card renderer, in the Layered Paper style.
 *
 * Deliberately asset-free: cream paper, ink border, corner registration ticks,
 * a mono coordinate caption. The cartographic identity is carried by the
 * palette, the 2px border, and the corner ticks rather than by the typeface,
 * so no font file has to be fetched at build time. ImageResponse only supports
 * flexbox layout and inline styles, which is why this reads nothing like the
 * rest of the CSS.
 *
 * Light theme only on purpose: a social card has no viewer theme to honour, and
 * the cream sheet is the more recognisable half of the brand.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const INK = '#16240f';
const PAPER = '#f6f1e4';
const GREEN = '#4c9f1a';
const MUTED = '#4b5a40';

const TICK = 26;

function CornerTick({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const v: React.CSSProperties = { position: 'absolute', width: TICK, height: TICK };
  const b = `4px solid ${INK}`;
  if (pos === 'tl') Object.assign(v, { top: 40, left: 40, borderTop: b, borderLeft: b });
  if (pos === 'tr') Object.assign(v, { top: 40, right: 40, borderTop: b, borderRight: b });
  if (pos === 'bl') Object.assign(v, { bottom: 40, left: 40, borderBottom: b, borderLeft: b });
  if (pos === 'br') Object.assign(v, { bottom: 40, right: 40, borderBottom: b, borderRight: b });
  return <div style={v} />;
}

type Props = {
  /** The big line. Usually the page's promise. */
  title: string;
  /** Small uppercase eyebrow above the title. */
  eyebrow?: string;
  /** Mono caption bottom-left, like a survey plate figure line. */
  caption?: string;
};

export function ogImage({ title, eyebrow = 'Geo Hound', caption }: Props) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: PAPER,
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* faint graticule */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to right, rgba(22,36,15,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(22,36,15,0.06) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <CornerTick pos="tl" />
        <CornerTick pos="tr" />
        <CornerTick pos="bl" />
        <CornerTick pos="br" />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            padding: '96px 100px',
          }}
        >
          {/* wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 34 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 40,
                border: `4px solid ${GREEN}`,
                display: 'flex',
                marginRight: 16,
              }}
            />
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: 'uppercase',
                color: MUTED,
              }}
            >
              {eyebrow}
            </div>
          </div>

          <div
            style={{
              fontSize: title.length > 46 ? 62 : 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              color: INK,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
        </div>

        {/* mono caption bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 100px 64px',
            fontSize: 20,
            color: MUTED,
            fontFamily: 'monospace',
          }}
        >
          <div>{caption ?? 'CHROME EXTENSION / GIS DATA FROM ANY WEB MAP'}</div>
          <div style={{ color: GREEN }}>geohound.app</div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
