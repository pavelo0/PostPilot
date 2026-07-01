import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
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
  if (mimeType === 'image/png') {
    return 'png';
  }
  if (mimeType === 'image/gif') {
    return 'gif';
  }
  return 'jpg';
}

/**
 * Stores media files on local disk for development.
 */
export class LocalMediaStorage implements MediaStorage {
  constructor(private readonly basePath: string) {}

  async save(input: SaveMediaInput): Promise<SaveMediaResult> {
    const extension = getExtension(input.originalName, input.mimeType);
    const storageKey = `posts/${input.postId}/${input.mediaId}.${extension}`;
    const absolutePath = this.resolvePath(storageKey);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.buffer);

    return { storageKey };
  }

  async load(storageKey: string): Promise<StoredMediaFile> {
    const absolutePath = this.resolvePath(storageKey);
    const buffer = await readFile(absolutePath);
    const originalName = storageKey.split('/').pop() ?? storageKey;
    const mimeType = this.guessMimeType(originalName);

    return { buffer, mimeType, originalName };
  }

  async delete(storageKey: string): Promise<void> {
    const absolutePath = this.resolvePath(storageKey);
    await rm(absolutePath, { force: true });
  }

  async deleteMany(storageKeys: string[]): Promise<void> {
    await Promise.all(storageKeys.map((key) => this.delete(key)));
  }

  private resolvePath(storageKey: string): string {
    return resolve(this.basePath, storageKey);
  }

  private guessMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4':
      case 'mov':
        return 'video/mp4';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }
}

export function resolveLocalMediaBasePath(): string {
  const configured = process.env.MEDIA_STORAGE_PATH ?? './data/media';
  return resolve(process.cwd(), configured);
}
