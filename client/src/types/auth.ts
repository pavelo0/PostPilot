export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
};

export type AuthCredentials = {
  email: string;
  password: string;
};
