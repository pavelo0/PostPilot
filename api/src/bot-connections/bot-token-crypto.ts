import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { InternalServerErrorException } from '@nestjs/common';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;

/**
 * Encrypts and decrypts per-user Telegram bot tokens.
 */
export class BotTokenCrypto {
  private readonly key: Buffer;

  constructor() {
    this.key = this.readEncryptionKey();
  }

  /**
   * Encrypts plaintext token into transport-safe payload.
   */
  encrypt(plainToken: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainToken, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('base64')}.${authTag.toString('base64')}.${encrypted.toString('base64')}`;
  }

  /**
   * Decrypts encrypted token payload.
   */
  decrypt(payload: string): string {
    const [ivPart, authTagPart, encryptedPart] = payload.split('.');
    if (!ivPart || !authTagPart || !encryptedPart) {
      throw new InternalServerErrorException('Stored bot token is corrupted');
    }

    try {
      const iv = Buffer.from(ivPart, 'base64');
      const authTag = Buffer.from(authTagPart, 'base64');
      const encrypted = Buffer.from(encryptedPart, 'base64');

      const decipher = createDecipheriv(ALGORITHM, this.key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);
      return decrypted.toString('utf8');
    } catch {
      throw new InternalServerErrorException('Failed to decrypt bot token');
    }
  }

  private readEncryptionKey(): Buffer {
    const rawKey = process.env.BOT_TOKEN_ENCRYPTION_KEY?.trim();
    if (rawKey) {
      const key = Buffer.from(rawKey, 'base64');
      if (key.length !== 32) {
        throw new InternalServerErrorException(
          'BOT_TOKEN_ENCRYPTION_KEY must be base64-encoded 32-byte key',
        );
      }
      return key;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new InternalServerErrorException(
        'BOT_TOKEN_ENCRYPTION_KEY is not configured',
      );
    }

    return createHash('sha256')
      .update('postpilot-dev-bot-token-encryption-fallback')
      .digest()
      .subarray(0, 32);
  }
}
