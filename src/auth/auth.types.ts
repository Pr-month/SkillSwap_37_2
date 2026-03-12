import { Request } from 'express';
import { UserRole } from '../users/users.enums';

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type TAuthRequest = Request & {
  user: JwtPayload;
};

export type UserFromRefreshToken = {
  id: string;
  email: string;
  role: UserRole;
  refreshToken: string;
};
