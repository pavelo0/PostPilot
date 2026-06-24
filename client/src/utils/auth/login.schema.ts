import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Введите корректный email')
    .max(255, 'Email не должен быть длиннее 255 символов'),
  password: z
    .string()
    .min(8, 'Минимум 8 символов')
    .max(72, 'Максимум 72 символа'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type LoginFormErrors = Partial<Record<keyof LoginFormData, string>>
