import { z } from 'zod'

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Введите имя')
    .max(100, 'Имя не должно быть длиннее 100 символов'),
  lastName: z
    .string()
    .trim()
    .max(100, 'Фамилия не должна быть длиннее 100 символов'),
  email: z
    .string()
    .trim()
    .email('Введите корректный email')
    .max(255, 'Email не должен быть длиннее 255 символов'),
  password: z
    .string()
    .min(8, 'Минимум 8 символов')
    .max(72, 'Максимум 72 символа')
    .regex(/[A-Z]/, 'Добавьте хотя бы одну заглавную букву')
    .regex(/[a-z]/, 'Добавьте хотя бы одну строчную букву')
    .regex(/\d/, 'Добавьте хотя бы одну цифру'),
})

export type RegisterFormData = z.infer<typeof registerSchema>
export type RegisterFormErrors = Partial<Record<keyof RegisterFormData, string>>
