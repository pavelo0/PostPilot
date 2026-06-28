import { z } from 'zod'

/**
 * Validates post body before save or publish.
 */
export const postBodySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Введите текст поста')
    .max(4096, 'Текст поста не должен превышать 4096 символов'),
})

export type PostBodyFormData = z.infer<typeof postBodySchema>
