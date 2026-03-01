import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { jwtConfig } from '../config/jwt.config';

@Module({
  imports: [UsersModule, PassportModule, ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: JwtAccessStrategy,
      useFactory: (config: ConfigType<typeof jwtConfig>) =>
        new JwtAccessStrategy(config),
      inject: [jwtConfig.KEY],
    },

    {
      provide: JwtRefreshStrategy,
      useFactory: (config: ConfigType<typeof jwtConfig>) =>
        new JwtRefreshStrategy(config),
      inject: [jwtConfig.KEY],
    },
  ],
})
export class AuthModule {}
