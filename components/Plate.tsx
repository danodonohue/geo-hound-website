import Image from 'next/image';

type Props = {
  /** Figure number as printed in the caption, e.g. "02". */
  fig: string;
  /** Caption text after the figure number. Kept short; set in mono. */
  caption: string;
  /** Path under /public. Omit while the capture is outstanding. */
  src?: string;
  /** Required whenever src is set. Describes what the screenshot shows. */
  alt?: string;
  /** Renders first-viewport plates eagerly. */
  priority?: boolean;
  /** Shown inside the placeholder so an outstanding shot is identifiable. */
  pendingNote?: string;
};

/**
 * A screenshot presented as a plate in a survey document: 2px ink border,
 * corner registration ticks, mono caption beneath.
 *
 * The frame is locked to the 1280x800 capture aspect, so a pending placeholder
 * and the real screenshot occupy identical space. Dropping a capture in later
 * shifts no layout.
 *
 * While src is absent this deliberately renders a blank plate rather than
 * fake product UI. A mockup that invents an interface teaches the wrong thing
 * about what the product does.
 */
export function Plate({ fig, caption, src, alt, priority, pendingNote }: Props) {
  return (
    <figure className="gh-plate">
      <div className="gh-plate__frame gh-ticks">
        {src ? (
          <Image
            src={src}
            alt={alt ?? ''}
            width={1280}
            height={800}
            priority={priority}
            sizes="(max-width: 900px) 100vw, 1180px"
          />
        ) : (
          <div className="gh-plate__pending">
            <span className="gh-label">Plate pending</span>
            {pendingNote ? (
              <span className="gh-mono gh-faint" style={{ fontSize: 11 }}>
                {pendingNote}
              </span>
            ) : null}
          </div>
        )}
      </div>
      <figcaption className="gh-plate__caption">
        FIG {fig} / {caption}
      </figcaption>
    </figure>
  );
}
