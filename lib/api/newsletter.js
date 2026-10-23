import { mutateAPI } from './fetcher';

/**
 * POST /newsletter/subscribe — Mailchimp list via kennedys-api (requires MAILCHIMP_* on server).
 * @param {string} email
 * @param {{ firstName?: string; lastName?: string }} [extra]
 */
export async function subscribeNewsletter(email, extra = {}) {
  return mutateAPI('newsletter/subscribe', 'POST', {
    email: String(email || '').trim(),
    ...extra,
  });
}
