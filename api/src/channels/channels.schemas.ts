import { z } from 'zod';

export const connectChannelSchema = z.object({
  channel: z.string().trim().min(1, 'Channel is required').max(255),
});

export type ConnectChannelInput = z.infer<typeof connectChannelSchema>;
