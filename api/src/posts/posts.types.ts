export const POST_STATUSES = ['draft', 'scheduled', 'published', 'failed'] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export type PostMediaDto = {
  id: string;
  mediaType: 'photo' | 'video';
  telegramFileId: string | null;
  originalName: string | null;
  mimeType: string | null;
  order: number;
  isPending: boolean;
};

export type PostDto = {
  id: string;
  userId: string;
  channelId: string | null;
  title: string | null;
  body: string;
  status: PostStatus;
  scheduledAt: string | null;
  telegramMessageId: number | null;
  publishedAt: string | null;
  errorMessage: string | null;
  telegramPostUrl: string | null;
  channelLabel: string | null;
  createdAt: string;
  updatedAt: string;
  mediaItems: PostMediaDto[];
};
