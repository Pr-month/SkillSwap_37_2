import { Request } from 'express';

export type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

export type TAuthRequest = Request & {
  user: JwtPayload;
};
