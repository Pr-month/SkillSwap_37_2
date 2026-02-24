import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { appConfig } from './config/app.config';
import { jwtConfig } from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig],
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
