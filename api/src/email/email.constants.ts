const DEFAULT_EMAIL_FROM = 'PostPilot <onboarding@resend.dev>';

/**
 * Resend API key. When empty, emails are not sent (console fallback only).
 */
export const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() ?? '';

/**
 * Sender address. Use a verified domain in production.
 */
export const EMAIL_FROM =
  process.env.EMAIL_FROM?.trim() ?? DEFAULT_EMAIL_FROM;

export const EMAIL_VERIFICATION_SUBJECT =
  process.env.EMAIL_VERIFICATION_SUBJECT?.trim() ??
  'PostPilot — код подтверждения';
