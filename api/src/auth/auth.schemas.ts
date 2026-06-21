import { z } from 'zod';

export const authCredentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
});

export type AuthCredentialsInput = z.infer<typeof authCredentialsSchema>;
