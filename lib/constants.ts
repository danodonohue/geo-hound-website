/**
 * Single point of change for every value the owner expects to edit after launch.
 * Nothing in this file may be duplicated into a component, a string of copy, or
 * an image. If a number appears on the site, it is read from here.
 *
 * House rule: no emoji or dingbat characters anywhere in this codebase.
 */

/* --------------------------------------------------------------------------
   Identity and URLs
   -------------------------------------------------------------------------- */

/** Confirmed by the owner. Matches the HTTP-Referer the chat proxy already sends. */
export const SITE_DOMAIN = 'geohound.app';
export const SITE_URL = `https://${SITE_DOMAIN}`;

/**
 * PENDING OWNER CONFIRMATION. Working candidate from the brief.
 * Used by /support, /services, the footer imprint, and the contact form target.
 */
export const CONTACT_EMAIL = 'geohound@mapscaping.com';

/**
 * PENDING OWNER CONFIRMATION. The MapScaping business entity as it appears on
 * the Stripe account and on the store listing's EU trader disclosure. The site
 * imprint and /terms must match the store listing exactly, so this must be set
 * before launch. Rendered literally, so a placeholder is visibly wrong on page.
 */
export const SELLER_NAME = 'SELLER_NAME_PENDING';

/** True once the owner has confirmed the legal seller identity. Gates a build check. */
export const SELLER_NAME_CONFIRMED = false;

/**
 * Live on the Chrome Web Store as of 2026-07-17.
 *
 * Deliberately stored without the authuser and hl query parameters the owner's
 * dashboard link carried: authuser=0 is specific to a signed-in Google profile
 * and misroutes anyone whose default profile differs. The canonical detail URL
 * is the one to publish.
 */
export const CHROME_STORE_URL: string | null =
  'https://chromewebstore.google.com/detail/geo-hound/nooldeimgcodenhncjkjagbmppdinhfe';

/** Assigned by the Chrome Web Store. Useful for support instructions. */
export const CHROME_EXTENSION_ID = 'nooldeimgcodenhncjkjagbmppdinhfe';

/**
 * PENDING. Google Analytics measurement ID (format G-XXXXXXXXXX). While null,
 * no analytics script is injected and no consent banner is shown, so local and
 * preview builds stay clean.
 */
export const GA_MEASUREMENT_ID: string | null = null;

export const MAPSCALING_URL = 'https://mapscaping.com';
export const PODCAST_URL = 'https://mapscaping.com/podcast';

/* --------------------------------------------------------------------------
   Product facts
   Verified against the extension source on 2026-07-17, not copied from memory.
   -------------------------------------------------------------------------- */

/** Count of tool definitions in the extension's lib/chat-tool-defs.js. */
export const ASSISTANT_TOOL_COUNT = 26;

/** Extension version from manifest.json. */
export const EXTENSION_VERSION = '1.9';

/** chat-proxy CHAT_FREE_QUOTA default. */
export const FREE_QUESTIONS_PER_MONTH = 10;

/** chat-proxy CHAT_CREDITS_PER_QUESTION default. */
export const CREDITS_PER_QUESTION = 1;

/**
 * The AI gateway that receives assistant traffic. The proxy relays to
 * OpenRouter, which routes on to third-party model providers. Named at this
 * level of granularity on purpose: the specific model is env-configurable
 * (CHAT_MODEL) and can change without a site deploy, so the policy describes
 * the gateway and the fact that it routes onward.
 */
export const AI_GATEWAY = 'OpenRouter';
export const AI_GATEWAY_URL = 'https://openrouter.ai';

/* --------------------------------------------------------------------------
   Pricing
   Prices are expected to rise. They are data, never baked into imagery.
   -------------------------------------------------------------------------- */

export type CreditPack = {
  id: string;
  /** Price in whole US dollars. */
  price: number;
  /** Questions granted by the pack. */
  questions: number;
  /** Exactly one pack may be featured. Enforced by a test. */
  featured?: boolean;
};

export const CREDIT_PACKS: readonly CreditPack[] = [
  { id: 'starter', price: 10, questions: 250 },
  { id: 'standard', price: 20, questions: 550, featured: true },
  { id: 'bulk', price: 40, questions: 1200 },
] as const;

export const CURRENCY = 'USD';
export const CURRENCY_SYMBOL = '$';

/** Formats a pack price. Kept here so no component invents its own format. */
export function formatPrice(dollars: number): string {
  return `${CURRENCY_SYMBOL}${dollars}`;
}

/* --------------------------------------------------------------------------
   Legal page dates
   Bump when the substantive content of the page changes.
   -------------------------------------------------------------------------- */

export const PRIVACY_LAST_UPDATED = '2026-07-17';
export const TERMS_LAST_UPDATED = '2026-07-17';

/** Support response expectation stated on /support. */
export const SUPPORT_RESPONSE_DAYS = 2;

/* --------------------------------------------------------------------------
   Derived helpers
   -------------------------------------------------------------------------- */

export const IS_STORE_LIVE = CHROME_STORE_URL !== null;

/** The one place the coming-soon wording lives. */
export const INSTALL_CTA_LABEL = IS_STORE_LIVE
  ? 'Add to Chrome'
  : 'Coming soon to the Chrome Web Store';
