import { z } from 'zod';

const scheduledAtField = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime())
  .optional();

export const createPostSchema = z
  .object({
    title: z.string().trim().max(120).optional(),
    body: z.string().trim().min(1).max(4000),
    scheduledAt: scheduledAtField,
    channelId: z.string().trim().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.scheduledAt && !value.channelId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'channelId is required when scheduling a post',
        path: ['channelId'],
      });
    }
  });

export const updatePostSchema = z
  .object({
    title: z.string().trim().max(120).optional(),
    body: z.string().trim().min(1).max(4000).optional(),
    scheduledAt: scheduledAtField.nullable().optional(),
    channelId: z.string().trim().min(1).optional(),
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
  status: z.enum(['draft', 'scheduled', 'published', 'failed']).optional(),
});

export const calendarPostsQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be YYYY-MM-DD'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PublishPostInput = z.infer<typeof publishPostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type CalendarPostsQuery = z.infer<typeof calendarPostsQuerySchema>;
