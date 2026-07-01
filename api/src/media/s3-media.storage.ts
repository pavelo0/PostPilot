import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type {
  MediaStorage,
  SaveMediaInput,
  SaveMediaResult,
  StoredMediaFile,
} from './media-storage.interface';

function getExtension(originalName: string, mimeType: string): string {
  const fromName = originalName.includes('.')
    ? originalName.split('.').pop()?.toLowerCase()
    : undefined;
  if (fromName) {
    return fromName;
  }
  if (mimeType.startsWith('video/')) {
    return 'mp4';
  }
  return 'jpg';
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  if (!body || typeof body !== 'object') {
    throw new Error('Empty S3 object body');
  }

  if ('transformToByteArray' in body && typeof body.transformToByteArray === 'function') {
    const bytes = await body.transformToByteArray();
    return Buffer.from(bytes);
  }

  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<Buffer>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Stores media in S3-compatible object storage (Cloudflare R2, AWS S3).
 */
export class S3MediaStorage implements MediaStorage {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(options: {
    bucket: string;
    endpoint?: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  }) {
    this.bucket = options.bucket;
    this.client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
      forcePathStyle: Boolean(options.endpoint),
    });
  }

  async save(input: SaveMediaInput): Promise<SaveMediaResult> {
    const extension = getExtension(input.originalName, input.mimeType);
    const storageKey = `posts/${input.postId}/${input.mediaId}.${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: input.buffer,
        ContentType: input.mimeType,
      }),
    );

    return { storageKey };
  }

  async load(storageKey: string): Promise<StoredMediaFile> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
      }),
    );

    const buffer = await streamToBuffer(response.Body);
    const originalName = storageKey.split('/').pop() ?? storageKey;

    return {
      buffer,
      mimeType: response.ContentType ?? 'application/octet-stream',
      originalName,
    };
  }

  async delete(storageKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
      }),
    );
  }

  async deleteMany(storageKeys: string[]): Promise<void> {
    if (storageKeys.length === 0) {
      return;
    }

    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: storageKeys.map((Key) => ({ Key })),
        },
      }),
    );
  }
}

export function createS3MediaStorageFromEnv(): S3MediaStorage {
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'S3 media storage requires S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY',
    );
  }

  return new S3MediaStorage({
    bucket,
    accessKeyId,
    secretAccessKey,
    region: process.env.S3_REGION ?? 'auto',
    endpoint: process.env.S3_ENDPOINT,
  });
}
