export type ChannelItem = {
  id: string;
  userId: string;
  telegramChatId: string;
  telegramUsername: string | null;
  title: string | null;
  botConnectedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ConnectChannelInput = {
  channel: string;
};
