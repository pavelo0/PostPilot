import { z } from 'zod';

export const connectBotSchema = z.object({
  token: z
    .string()
    .trim()
    .min(20, 'Token must be at least 20 characters')
    .max(512, 'Token is too long'),
});

export type ConnectBotInput = z.infer<typeof connectBotSchema>;
