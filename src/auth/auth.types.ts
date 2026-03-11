import { Request } from 'express';

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export type TAuthRequest = Request & {
  user: JwtPayload;
};

export type UserFromRefreshToken = {
  id: string;
  email: string;
  role: string;
  refreshToken: string;
};
