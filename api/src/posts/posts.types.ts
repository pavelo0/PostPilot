export const POST_STATUSES = ['draft', 'published', 'failed'] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export type PostDto = {
  id: string;
  userId: string;
  channelId: string | null;
  title: string | null;
  body: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
};
