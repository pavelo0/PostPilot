import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Resend } from 'resend';
import {
  EMAIL_FROM,
  EMAIL_VERIFICATION_SUBJECT,
  RESEND_API_KEY,
} from './email.constants';

type SendVerificationCodeParams = {
  to: string;
  code: string;
  ttlMinutes: number;
};

/**
 * Sends transactional emails via Resend when RESEND_API_KEY is configured.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;

  constructor() {
    this.resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
  }

  /**
   * Returns true when Resend client is configured.
   */
  isConfigured(): boolean {
    return this.resend !== null;
  }

  /**
   * Sends email verification code to the user.
   */
  async sendVerificationCode(
    params: SendVerificationCodeParams,
  ): Promise<void> {
    const { to, code, ttlMinutes } = params;

    if (!this.resend) {
      this.logger.warn(
        `RESEND_API_KEY is not set — skipping verification email to ${to}`,
      );
      return;
    }

    const text = [
      `Ваш код подтверждения PostPilot: ${code}`,
      '',
      `Код действует ${ttlMinutes} мин.`,
      'Если вы не регистрировались — проигнорируйте это письмо.',
    ].join('\n');

    const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; line-height: 1.5;">
        <p>Ваш код подтверждения PostPilot:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${code}</p>
        <p style="color: #666;">Код действует ${ttlMinutes} мин.</p>
        <p style="color: #666; font-size: 13px;">Если вы не регистрировались — проигнорируйте это письмо.</p>
      </div>
    `.trim();

    const { error } = await this.resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: EMAIL_VERIFICATION_SUBJECT,
      text,
      html,
    });

    if (error) {
      this.logger.error(
        `Resend failed for ${to}: ${error.message} (${error.name})`,
      );
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }

    this.logger.log(`Verification email sent to ${to}`);
  }
}
