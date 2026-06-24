import type { Request } from 'express';

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
};

export type RegisterStartResponse = {
  requiresVerification: true;
  email: string;
  resendAvailableInSeconds: number;
  verificationCode?: string;
};

export type AuthenticatedRequest = Request & {
  authUser?: AuthUser;
  sessionToken?: string;
};
