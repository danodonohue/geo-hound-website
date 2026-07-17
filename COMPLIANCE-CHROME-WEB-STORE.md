# Chrome Web Store Compliance - What the Website Must Host

Researched July 2026 against official Google documentation (URLs cited
inline). Note: a new Chrome Web Store policy wave is **enforced from
August 1, 2026** - the site must be built to that baseline.

Summary for the designer: the website is not just marketing. Four of its
pages are compliance artifacts the Chrome Web Store listing will point to,
and their content is partly dictated by policy.

---

## 1. Privacy policy page (/privacy) - REQUIRED

Any extension that handles user data must post an accurate privacy policy
and link it in the Developer Dashboard. Geo Hound handles "web browsing
activity" (its webRequest detection is squarely inside Google's definition),
so this is mandatory even though most data stays local.

The policy must disclose:

- What browsing activity is inspected and why (network requests scanned to
  detect GIS service URLs; what is stored).
- What is stored locally vs synced to Supabase (name Supabase).
- The AI assistant data flow: chat messages plus layer schemas/counts/small
  samples are sent to our backend proxy and forwarded to the LLM provider
  (name the provider); state whether prompts are retained (currently:
  conversations are NOT stored server-side).
- Stripe as the payment processor (the extension never sees card data).
- Every third party data touches: Supabase, Stripe, the LLM provider,
  Resend (purchase-confirmation emails).
- Retention and encryption practices (HTTPS in transit; encrypted at rest).
- A promise to prominently disclose any future change in data practices
  (Aug 2026 policy requires proactive in-product disclosure of changes).
- **The Limited Use affirmative statement** - policy requires this exact
  kind of sentence on the site or in the policy:
  "Geo Hound's use of information received from Chrome APIs adheres to the
  Chrome Web Store User Data Policy, including the Limited Use requirements."

Sources:
- https://developer.chrome.com/docs/webstore/program-policies/privacy
- https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
- https://developer.chrome.com/docs/webstore/program-policies/limited-use
- https://developer.chrome.com/blog/cws-policy-updates-2026

## 2. Terms of Service / Terms of Sale page (/terms) - REQUIRED

Because the Assistant sells credit packs, Google's "Accepting Payment From
Users" policy applies. It requires developers to:

- Make clear in the store description that a paid feature exists (free
  install + optional paid AI credits).
- **Conspicuously post terms of sale, including refund and return policies.**
- **Clearly identify that the developer, not Google, is the seller.**

So /terms must cover: what a credit is (1 credit = 1 question; assistant
tool steps free), packs are one-time purchases via Stripe, credits never
expire, the refund policy (full refunds only; a refund claws back the
credited balance), the credit-restore mechanism, seller legal identity
(the MapScaping business entity - owner to confirm exact name; use a
SELLER_NAME constant), and a "Google is not the seller" statement.

Source:
- https://developer.chrome.com/docs/webstore/program-policies/accepting-payment

## 3. Support page (/support) - store listing Support URL

The dashboard has Homepage URL and Support URL fields; the listing must
give users a working contact channel. /support carries the contact email
and links into docs/FAQ. The landing page (/) is the Homepage URL.

Source:
- https://developer.chrome.com/docs/webstore/cws-dashboard-listing

## 4. Trader disclosure (EU DSA, since Feb 2024) - affects footer/imprint

Selling credit packs makes the developer a **trader**. Google verifies and
**publicly displays** the trader's legal name, physical address, phone, and
email at the bottom of the store listing. Implication for the site: use a
business identity/address the owner is comfortable publishing, and keep the
site's legal identity consistent with it (a small imprint block in the
footer or on /terms is good practice).

Sources:
- https://developer.chrome.com/docs/webstore/program-policies/trader-disclosure
- https://developer.chrome.com/docs/webstore/program-policies/trader-verification-faq

## 5. Copy constraints that flow from store policy

These bind the website copy wherever it describes the product (consistency
between site, listing, and actual behavior is an enforcement criterion):

- **Single purpose framing.** Present Geo Hound as ONE workflow -
  "discover GIS services on pages you visit, then load, analyse, and export
  their data in a built-in workbench" - with the Assistant framed as an
  assistant FOR that workbench, never as a general-purpose AI chatbot.
- **Honest permissions story.** The site/FAQ should explain why the
  extension reads data on all websites (GIS services can be embedded
  anywhere; detection is passive) - matching the justification filed in the
  dashboard.
- **Free/paid split stated plainly** wherever installation is pitched:
  free to install, Detector + Workbench free, Assistant has 10 free
  questions/month then paid credits.
- No fake/unattributed testimonials, no keyword stuffing (also a store
  rule; keep the site consistent).
- Don't market anything as bypassing AI safety guardrails (banned from
  Aug 2026) - not a risk for us, just don't get cute in copy.

Sources:
- https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines
- https://developer.chrome.com/docs/webstore/program-policies/permissions
- https://developer.chrome.com/docs/webstore/program-policies/listing-requirements

## 6. Facts that are settled (no website action, context only)

- External Stripe payments are the sanctioned pattern; Google takes no
  commission and native CWS payments have been dead since 2021.
- Calling our LLM proxy is a data flow, not "remote code" - MV3 compliant;
  the extension declares "no remote code".
- The store listing itself needs: 128x128 icon, screenshots 1280x800
  (up to 5), small promo tile 440x280, optional marquee 1400x560 - see
  SCREENSHOTS.md; the same 1280x800 masters should be reused on the site.
- Verifying the site domain in Google Search Console earns the "Official
  URL" badge under the store listing title - do this once the domain is
  live.

Sources:
- https://developer.chrome.com/docs/webstore/images
- https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements
- https://developer.chrome.com/docs/extensions/ai
