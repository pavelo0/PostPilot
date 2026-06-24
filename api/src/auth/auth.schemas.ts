import { z, type ZodError } from 'zod';

export const authCredentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
});

export const registerSchema = authCredentialsSchema.extend({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional(),
});

export const registerVerifySchema = z.object({
  email: z.string().email().max(255),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
});

export const registerResendSchema = z.object({
  email: z.string().email().max(255),
});

export type AuthCredentialsInput = z.infer<typeof authCredentialsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterVerifyInput = z.infer<typeof registerVerifySchema>;
export type RegisterResendInput = z.infer<typeof registerResendSchema>;

export type ValidationErrorItem = {
  field: string;
  message: string;
};

export function formatZodValidationErrors(
  error: ZodError,
): ValidationErrorItem[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : 'body',
    message: issue.message,
  }));
}
