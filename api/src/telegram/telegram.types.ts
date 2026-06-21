export type TelegramChat = {
  id: number;
  title?: string;
  username?: string;
  type: 'channel' | 'supergroup' | 'group' | 'private';
};

export type TelegramChatMember = {
  status:
    | 'creator'
    | 'administrator'
    | 'member'
    | 'restricted'
    | 'left'
    | 'kicked';
};

export type TelegramSentMessage = {
  message_id: number;
};
