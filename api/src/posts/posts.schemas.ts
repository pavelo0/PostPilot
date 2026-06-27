import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(1).max(4000),
});

export const updatePostSchema = z
  .object({
    title: z.string().trim().max(120).optional(),
    body: z.string().trim().min(1).max(4000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export const publishPostSchema = z.object({
  channelId: z.string().trim().min(1).optional(),
});

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  status: z.enum(['draft', 'published', 'failed']).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PublishPostInput = z.infer<typeof publishPostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
