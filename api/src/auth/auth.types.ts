import type { Request } from 'express';

export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
};

export type AuthenticatedRequest = Request & {
  authUser?: AuthUser;
  sessionToken?: string;
};
