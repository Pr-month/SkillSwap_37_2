import { ConfigType, registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('JWT_CONFIG', () => ({
  secret: process.env.JWT_SECRET || 'defaultSecretKey',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshToken: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));

export type IJwtConfig = ConfigType<typeof jwtConfig>;
