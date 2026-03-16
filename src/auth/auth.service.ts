import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UserFromRefreshToken } from './auth.types';
import * as bcrypt from 'bcrypt';
import { ConfigType } from '@nestjs/config';
import { jwtConfig } from '../config/jwt.config';
import { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  private async getTokens(user: { id: string; email: string; role: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.refreshExpiresIn as StringValue,
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(createAuthDto: CreateAuthDto) {
    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

    const user = await this.usersService.createFromAuth({
      ...createAuthDto,
      password: hashedPassword,
    });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const tokens = await this.getTokens(userData);

    return {
      user: userData,
      tokens,
    };
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.usersService.findByEmail(loginAuthDto.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(
      loginAuthDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const tokens = await this.getTokens(userData);

    return {
      user: userData,
      tokens,
    };
  }

  async refresh(user: UserFromRefreshToken) {
    const isValid = await this.usersService.verifyRefreshToken(
      user.id,
      user.refreshToken,
    );
    if (!isValid) {
      throw new UnauthorizedException('Недействительный refresh токен');
    }
    const tokens = await this.getTokens(user);
    return { tokens };
  }

  async logout(userId: string) {
    await this.usersService.clearRefreshToken(userId);
    return { message: 'Вы успешно вышли из системы', userId };
  }
}
