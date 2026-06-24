import { z } from 'zod'

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Код должен состоять из 6 цифр'),
})

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>
export type VerifyEmailFormErrors = Partial<Record<keyof VerifyEmailFormData, string>>
