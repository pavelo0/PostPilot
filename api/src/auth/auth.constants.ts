const DEFAULT_SESSION_TTL_DAYS = 14;

/**
 * Cookie name used for session token storage.
 */
export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? 'postpilot_session';

/**
 * Session lifetime in days.
 */
export const SESSION_TTL_DAYS = Number(
  process.env.SESSION_TTL_DAYS ?? DEFAULT_SESSION_TTL_DAYS,
);
