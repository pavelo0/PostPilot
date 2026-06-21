export type ChannelDto = {
  id: string;
  userId: string;
  telegramChatId: string;
  telegramUsername: string | null;
  title: string | null;
  botConnectedAt: string;
  createdAt: string;
  updatedAt: string;
};
