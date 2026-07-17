'use client';

import { useState } from 'react';
import { CONTACT_EMAIL } from '@/lib/constants';
import styles from './ContactForm.module.css';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * The enquiry form for /services.
 *
 * Progressive-enhancement note: this needs JavaScript. The email address is
 * always shown next to it in plain text, so someone with JS off, or hitting a
 * failure, still has a way to reach a human. Never make the form the only
 * route to contact.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');

    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          org: data.get('org'),
          message: data.get('message'),
          website: data.get('website'),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? `Something went wrong. Please email ${CONTACT_EMAIL}.`);
        setStatus('error');
        return;
      }
      setStatus('sent');
    } catch {
      setError(`Could not reach the server. Please email ${CONTACT_EMAIL} directly.`);
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className={`gh-card ${styles.done}`} role="status">
        <span className="gh-label">Sent</span>
        <p className={styles.doneTitle}>Thanks. That has come through.</p>
        <p className={styles.doneBody}>
          You will get a reply within two business days, usually sooner. If it is urgent,
          email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </div>
    );
  }

  return (
    <form className={`gh-card ${styles.form}`} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className="gh-label">Name</span>
          <input className={styles.input} name="name" required autoComplete="name" />
        </label>
        <label className={styles.field}>
          <span className="gh-label">Email</span>
          <input
            className={styles.input}
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className="gh-label">Organisation (optional)</span>
        <input className={styles.input} name="org" autoComplete="organization" />
      </label>

      <label className={styles.field}>
        <span className="gh-label">What do you need?</span>
        <textarea
          className={styles.textarea}
          name="message"
          rows={6}
          required
          placeholder="What are you trying to do, who is it for, and roughly when do you need it?"
        />
      </label>

      {/* Honeypot. Hidden from people, irresistible to bots. Not type=hidden,
          because bots skip those. */}
      <div className={styles.hp} aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === 'error' ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button
          type="submit"
          className="gh-btn gh-btn--primary gh-btn--lg"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Sending...' : 'Send enquiry'}
        </button>
        <span className={styles.or}>
          or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </span>
      </div>
    </form>
  );
}
