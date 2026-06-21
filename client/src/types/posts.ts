export const POST_STATUSES = ['draft', 'published', 'failed'] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export type PostItem = {
  id: string;
  userId: string;
  title: string | null;
  body: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostInput = {
  title?: string;
  body: string;
  status?: PostStatus;
};

export type UpdatePostInput = Partial<CreatePostInput>;
