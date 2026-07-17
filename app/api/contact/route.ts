import { NextResponse } from 'next/server';
import { CONTACT_EMAIL } from '@/lib/constants';

/**
 * The contact form endpoint. The only server-side code on the site.
 *
 * Sends via Resend, which is already a disclosed processor for purchase and
 * restore emails, so the form adds no new third party to the privacy policy.
 * That was the deciding factor over a form-handling SaaS.
 *
 * RESEND_API_KEY and CONTACT_FROM must be set in the Vercel project. Without
 * the key the route returns 503 rather than pretending to have sent: a contact
 * form that silently swallows enquiries is worse than one that is honestly
 * broken, because the sender walks away believing they made contact.
 */

export const runtime = 'nodejs';

const MAX_LEN = { name: 120, email: 200, org: 160, message: 5000 } as const;

type Payload = {
  name?: unknown;
  email?: unknown;
  org?: unknown;
  message?: unknown;
  /** Honeypot. Must be empty. Bots fill every field they find. */
  website?: unknown;
};

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/* Deliberately permissive. The goal is to catch a typo, not to police what a
   valid address looks like: real addresses break every clever regex. */
function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  /* Honeypot: a real person never sees this field, so anything in it is a bot.
     Return 200 so the bot believes it succeeded and does not retry. */
  if (str(body.website, 200) !== '') {
    return NextResponse.json({ ok: true });
  }

  const name = str(body.name, MAX_LEN.name);
  const email = str(body.email, MAX_LEN.email);
  const org = str(body.org, MAX_LEN.org);
  const message = str(body.message, MAX_LEN.message);

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: 'Please fill in your name, email, and a message.' },
      { status: 400 },
    );
  }

  if (!looksLikeEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'That email address does not look right.' },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM ?? `Geo Hound site <${CONTACT_EMAIL}>`;

  if (!apiKey) {
    console.error('contact: RESEND_API_KEY is not set, enquiry not sent');
    return NextResponse.json(
      {
        ok: false,
        error: `The form is not configured yet. Please email ${CONTACT_EMAIL} directly.`,
      },
      { status: 503 },
    );
  }

  const text = [
    `From: ${name} <${email}>`,
    org ? `Organisation: ${org}` : null,
    '',
    message,
  ]
    .filter((line) => line !== null)
    .join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [CONTACT_EMAIL],
        /* So a reply goes to the enquirer, not to ourselves. */
        reply_to: email,
        subject: `Geo Hound enquiry: ${name}${org ? ` (${org})` : ''}`,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('contact: resend rejected the send', res.status, detail.slice(0, 300));
      return NextResponse.json(
        { ok: false, error: `Could not send. Please email ${CONTACT_EMAIL} directly.` },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('contact: resend unreachable', e);
    return NextResponse.json(
      { ok: false, error: `Could not send. Please email ${CONTACT_EMAIL} directly.` },
      { status: 502 },
    );
  }
}
