/**
 * PostPilot email brand tokens (aligned with client/src/index.css).
 * Hex/rgba only — email clients do not support oklch or CSS variables.
 */
export const EMAIL_BRAND = {
  fontFamily:
    "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontMono: "ui-monospace, 'SF Mono', Consolas, 'Liberation Mono', monospace",
  logoTeal: '#005B60',
  primary: '#6366F1',
  heading: '#08060d',
  body: '#6b6375',
  muted: '#9ca3af',
  background: '#f4f3ec',
  card: '#ffffff',
  border: '#e5e7eb',
  accentBg: 'rgba(170, 59, 255, 0.1)',
  accentBorder: 'rgba(170, 59, 255, 0.5)',
  primaryForeground: '#ffffff',
  radius: '10px',
  shadow:
    'rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px',
} as const;
