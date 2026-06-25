export type BotHealthStatus = 'connected' | 'missing' | 'token_invalid';

export type ChannelBotAdminStatus =
  | 'admin'
  | 'not_admin'
  | 'unknown'
  | 'check_failed';

export type BotChannelStatusDto = {
  id: string;
  telegramUsername: string | null;
  title: string | null;
  telegramChatId: string;
  adminStatus: ChannelBotAdminStatus;
};

export type BotConnectionDto = {
  configured: boolean;
  tokenMask: string | null;
  health: BotHealthStatus;
  username: string | null;
  connectedAt: string | null;
  disconnectedAt: string | null;
  progressConnectedOnce: boolean;
  progressConnectedOnceAt: string | null;
};

export type BotSetupDto = {
  bot: BotConnectionDto;
  channels: BotChannelStatusDto[];
};
