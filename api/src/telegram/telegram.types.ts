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

export type TelegramPhoto = {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
};

export type TelegramVideo = {
  file_id: string;
  file_unique_id: string;
  duration: number;
  file_size?: number;
};

export type TelegramPhotoMessage = TelegramSentMessage & {
  photo: TelegramPhoto[];
};

export type TelegramVideoMessage = TelegramSentMessage & {
  video: TelegramVideo;
};
