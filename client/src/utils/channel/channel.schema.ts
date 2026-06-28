import { z } from 'zod'

export const connectChannelSchema = z.object({
  channelReference: z
    .string()
    .trim()
    .min(1, 'Введите username канала или chat ID')
    .max(255, 'Слишком длинное значение'),
})

export type ConnectChannelFormData = z.infer<typeof connectChannelSchema>
