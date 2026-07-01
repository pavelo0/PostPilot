import type { MediaStorage } from './media-storage.interface';
import {
  LocalMediaStorage,
  resolveLocalMediaBasePath,
} from './local-media.storage';
import { createS3MediaStorageFromEnv } from './s3-media.storage';

/**
 * Creates media storage backend from environment configuration.
 */
export function createMediaStorageFromEnv(): MediaStorage {
  const mode = (process.env.MEDIA_STORAGE ?? 'local').toLowerCase();

  if (mode === 's3') {
    return createS3MediaStorageFromEnv();
  }

  return new LocalMediaStorage(resolveLocalMediaBasePath());
}
