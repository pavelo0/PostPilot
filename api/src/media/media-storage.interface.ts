export type StoredMediaFile = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
};

export type SaveMediaInput = {
  postId: string;
  mediaId: string;
  buffer: Buffer;
  mimeType: string;
  originalName: string;
};

export type SaveMediaResult = {
  storageKey: string;
};

/**
 * Persists post media files until publish (local disk or S3-compatible).
 */
export interface MediaStorage {
  save(input: SaveMediaInput): Promise<SaveMediaResult>;
  load(storageKey: string): Promise<StoredMediaFile>;
  delete(storageKey: string): Promise<void>;
  deleteMany(storageKeys: string[]): Promise<void>;
}

export const MEDIA_STORAGE = Symbol('MEDIA_STORAGE');
