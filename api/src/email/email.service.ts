import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Resend } from 'resend';
import {
  APP_PUBLIC_URL,
  EMAIL_FROM,
  EMAIL_VERIFICATION_SUBJECT,
  RESEND_API_KEY,
} from './email.constants';
import { buildVerificationCodeEmail } from './templates/verification-code.template';

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

    const { html, text } = buildVerificationCodeEmail({
      code,
      ttlMinutes,
      appUrl: APP_PUBLIC_URL || undefined,
    });

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
