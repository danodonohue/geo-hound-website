import { CHROME_STORE_URL, INSTALL_CTA_LABEL } from '@/lib/constants';

type Props = {
  /** Filled ink (light) / lime (dark). Use once per view. */
  variant?: 'primary' | 'outline';
  size?: 'md' | 'lg';
  className?: string;
};

/**
 * The install call to action, in one place.
 *
 * The extension is not published yet, so CHROME_STORE_URL is null and this
 * renders a non-interactive coming-soon control. Setting that one constant to
 * the real store URL turns every instance across the site into a working link.
 * No component edits, no copy edits. That is the whole point of this file, so
 * do not hand-roll an install button anywhere else.
 */
export function InstallCta({ variant = 'primary', size = 'lg', className = '' }: Props) {
  const classes = [
    'gh-btn',
    variant === 'primary' ? 'gh-btn--primary' : '',
    size === 'lg' ? 'gh-btn--lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (CHROME_STORE_URL === null) {
    return (
      <span className={classes} aria-disabled="true" role="link" aria-label={INSTALL_CTA_LABEL}>
        {INSTALL_CTA_LABEL}
      </span>
    );
  }

  return (
    <a className={classes} href={CHROME_STORE_URL}>
      {INSTALL_CTA_LABEL}
    </a>
  );
}
