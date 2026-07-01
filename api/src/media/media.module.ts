import { Global, Module } from '@nestjs/common';
import { createMediaStorageFromEnv } from './media-storage.factory';
import { MEDIA_STORAGE } from './media-storage.interface';

@Global()
@Module({
  providers: [
    {
      provide: MEDIA_STORAGE,
      useFactory: () => createMediaStorageFromEnv(),
    },
  ],
  exports: [MEDIA_STORAGE],
})
export class MediaModule {}
