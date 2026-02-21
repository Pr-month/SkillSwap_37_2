export type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

export type PublicUser = {
  id: number;
  name: string;
  email: string;
};
