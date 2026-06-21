import { z } from 'zod';
import { POST_STATUSES } from './posts.types';

export const createPostSchema = z.object({
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(1).max(4000),
  status: z.enum(POST_STATUSES).optional(),
});

export const updatePostSchema = z
  .object({
    title: z.string().trim().max(120).optional(),
    body: z.string().trim().min(1).max(4000).optional(),
    status: z.enum(POST_STATUSES).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
