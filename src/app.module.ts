import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { appConfig } from './config/app.config';
import { jwtConfig } from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './config/db.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, dbConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [dbConfig.KEY],
      useFactory: (db: ConfigType<typeof dbConfig>) => db,
    }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'jwt-secret',
      signOptions: {
        expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN) || 3600,
      },
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
