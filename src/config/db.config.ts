import { ConfigType, registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dbConfig = registerAs(
  'DB_CONFIG',
  (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'skillswap',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: false,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  }),
);

export type IDbConfig = ConfigType<typeof dbConfig>;

export const AppDataSource = new DataSource(dbConfig());
