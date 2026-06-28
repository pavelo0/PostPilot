import { EMAIL_BRAND } from '../email-theme';

type BuildVerificationCodeEmailParams = {
  code: string;
  ttlMinutes: number;
  appUrl?: string;
};

type VerificationCodeEmailContent = {
  html: string;
  text: string;
};

/**
 * Builds branded HTML and plain-text bodies for email verification codes.
 */
export function buildVerificationCodeEmail(
  params: BuildVerificationCodeEmailParams,
): VerificationCodeEmailContent {
  const { code, ttlMinutes, appUrl } = params;
  const verifyUrl = appUrl ? `${appUrl.replace(/\/$/, '')}/verify-email` : null;

  const text = [
    'PostPilot — подтверждение email',
    '',
    `Ваш код: ${code}`,
    '',
    `Код действует ${ttlMinutes} мин. Не сообщайте его никому.`,
    verifyUrl ? `Открыть PostPilot: ${verifyUrl}` : null,
    '',
    'Если вы не регистрировались — проигнорируйте это письмо.',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>PostPilot — код подтверждения</title>
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_BRAND.background};font-family:${EMAIL_BRAND.fontFamily};color:${EMAIL_BRAND.body};-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${EMAIL_BRAND.background};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:${EMAIL_BRAND.card};border:1px solid ${EMAIL_BRAND.border};border-radius:${EMAIL_BRAND.radius};box-shadow:${EMAIL_BRAND.shadow};overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 0;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:600;letter-spacing:-0.02em;color:${EMAIL_BRAND.logoTeal};">
                PostPilot
              </p>
              <div style="height:3px;width:48px;background-color:${EMAIL_BRAND.primary};border-radius:999px;margin-bottom:28px;"></div>
              <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;font-weight:600;letter-spacing:-0.02em;color:${EMAIL_BRAND.heading};">
                Подтвердите email
              </h1>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:${EMAIL_BRAND.body};">
                Введите этот код на странице подтверждения, чтобы завершить регистрацию в PostPilot.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${EMAIL_BRAND.accentBg};border:1px solid ${EMAIL_BRAND.accentBorder};border-radius:${EMAIL_BRAND.radius};">
                <tr>
                  <td align="center" style="padding:24px 16px;">
                    <p style="margin:0 0 8px;font-size:13px;line-height:1.4;color:${EMAIL_BRAND.body};text-transform:uppercase;letter-spacing:0.08em;">
                      Код подтверждения
                    </p>
                    <p style="margin:0;font-family:${EMAIL_BRAND.fontMono};font-size:32px;line-height:1;font-weight:700;letter-spacing:6px;color:${EMAIL_BRAND.heading};">
                      ${code}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0;font-size:14px;line-height:1.5;color:${EMAIL_BRAND.body};">
                Код действует <strong style="color:${EMAIL_BRAND.heading};">${ttlMinutes} мин.</strong> Не сообщайте его никому.
              </p>
            </td>
          </tr>
          ${
            verifyUrl
              ? `
          <tr>
            <td align="center" style="padding:28px 32px 0;">
              <a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:${EMAIL_BRAND.primary};color:${EMAIL_BRAND.primaryForeground};font-size:15px;font-weight:600;line-height:1;text-decoration:none;padding:14px 28px;border-radius:${EMAIL_BRAND.radius};">
                Открыть PostPilot
              </a>
            </td>
          </tr>
          `
              : ''
          }
          <tr>
            <td style="padding:32px;">
              <p style="margin:0;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.muted};border-top:1px solid ${EMAIL_BRAND.border};padding-top:24px;">
                Если вы не регистрировались в PostPilot — проигнорируйте это письмо.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { html, text };
}
