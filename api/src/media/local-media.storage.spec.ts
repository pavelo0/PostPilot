import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalMediaStorage } from './local-media.storage';

describe('LocalMediaStorage', () => {
  let basePath: string;
  let storage: LocalMediaStorage;

  beforeEach(async () => {
    basePath = await mkdtemp(join(tmpdir(), 'postpilot-media-'));
    storage = new LocalMediaStorage(basePath);
  });

  afterEach(async () => {
    await rm(basePath, { recursive: true, force: true });
  });

  it('saves and loads media by storage key', async () => {
    const buffer = Buffer.from('test-image');
    const { storageKey } = await storage.save({
      postId: 'post-1',
      mediaId: 'media-1',
      buffer,
      mimeType: 'image/jpeg',
      originalName: 'photo.jpg',
    });

    const loaded = await storage.load(storageKey);
    expect(loaded.buffer.equals(buffer)).toBe(true);
    expect(loaded.mimeType).toBe('image/jpeg');
    expect(loaded.originalName).toBe('media-1.jpg');
  });

  it('deletes stored media files', async () => {
    const { storageKey } = await storage.save({
      postId: 'post-1',
      mediaId: 'media-1',
      buffer: Buffer.from('payload'),
      mimeType: 'image/png',
      originalName: 'photo.png',
    });

    await storage.delete(storageKey);

    await expect(readFile(join(basePath, storageKey))).rejects.toThrow();
  });
});
