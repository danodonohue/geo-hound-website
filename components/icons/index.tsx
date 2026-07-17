/**
 * Line icons, Phosphor-style: 24px grid, currentColor strokes, no fills.
 *
 * This file exists because the project bans emoji and dingbat characters
 * outright. Anywhere a pictogram is wanted, it comes from here.
 *
 * Every icon is decorative by default (aria-hidden) and inherits its colour
 * and size from the surrounding text. Pass a title to make one meaningful to
 * assistive technology.
 */

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  /** Pixel size on the 24px grid. */
  size?: number;
  /** Supply only when the icon carries meaning no adjacent text conveys. */
  title?: string;
};

function Icon({ size = 24, title, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* --- theme toggle --- */

export const SunIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4.25" />
    <path d="M12 2.75v2M12 19.25v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2.75 12h2M19.25 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </Icon>
);

export const MoonIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.5 14.4A8.75 8.75 0 0 1 9.6 3.5a8.75 8.75 0 1 0 10.9 10.9Z" />
  </Icon>
);

/* --- the three layers --- */

/** Detector: a registration crosshair sweeping for a signal. */
export const CrosshairIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="7.25" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
  </Icon>
);

/** Workbench: stacked map layers. */
export const StackIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.25 2.75 8 12 12.75 21.25 8 12 3.25Z" />
    <path d="M2.75 12 12 16.75 21.25 12" />
    <path d="M2.75 16 12 20.75 21.25 16" />
  </Icon>
);

/** Assistant: a chat turn. */
export const ChatIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.25 12a8.75 8.75 0 1 1 3.6 7.06L3.25 20.75l1.69-3.6A8.7 8.7 0 0 1 3.25 12Z" />
    <path d="M8.5 10.5h7M8.5 14h4.5" />
  </Icon>
);

/* --- general --- */

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
  </Icon>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5" />
  </Icon>
);

export const MagnifyingGlassIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10.75" cy="10.75" r="6.75" />
    <path d="M15.6 15.6 20.5 20.5" />
  </Icon>
);

export const DownloadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5" />
    <path d="M3.75 16.5v2.25a1.75 1.75 0 0 0 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75V16.5" />
  </Icon>
);

/** Map sheet, folded. Used for the cartographic sections. */
export const MapIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 4.25 3.25 6.5v13.25L9 17.5l6 2.25 5.75-2.25V4.25L15 6.5 9 4.25Z" />
    <path d="M9 4.25v13.25M15 6.5v13.25" />
  </Icon>
);

/* --- use-case vignettes --- */

export const CompassIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.75" />
    <path d="m14.9 9.1-1.6 4.2-4.2 1.6 1.6-4.2 4.2-1.6Z" />
  </Icon>
);

export const NewspaperIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.25 6.5h13.5v13.25H5a1.75 1.75 0 0 1-1.75-1.75V6.5Z" />
    <path d="M16.75 9.5h4v8.25a2 2 0 0 1-4 0V9.5Z" />
    <path d="M6.25 10h7.5M6.25 13.25h7.5M6.25 16.5h4.5" />
  </Icon>
);

export const BuildingsIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.25 20.75V8.5l6.5-3.25V20.75" />
    <path d="M9.75 11.5h7.5a1.5 1.5 0 0 1 1.5 1.5v7.75" />
    <path d="M2 20.75h20M6 11.5v.01M6 15v.01M13 15v.01M13 18v.01" />
  </Icon>
);

export const PlantIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20.75v-8.5" />
    <path d="M12 12.25c0-3.6 2.9-6.5 6.5-6.5 0 3.6-2.9 6.5-6.5 6.5Z" />
    <path d="M12 15.5c-3 0-5.5-2.5-5.5-5.5 3 0 5.5 2.5 5.5 5.5Z" />
    <path d="M8 20.75h8" />
  </Icon>
);
