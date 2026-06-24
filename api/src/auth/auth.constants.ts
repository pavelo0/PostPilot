const DEFAULT_SESSION_TTL_DAYS = 14;

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? 'postpilot_session';

export const SESSION_TTL_DAYS = Number(
  process.env.SESSION_TTL_DAYS ?? DEFAULT_SESSION_TTL_DAYS,
);
