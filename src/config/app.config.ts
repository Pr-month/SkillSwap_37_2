import { ConfigType, registerAs } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  hashSalt: parseInt(process.env.HASH_SALT ?? '10', 10),
  environment: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
}));

export type IConfig = ConfigType<typeof appConfig>;
