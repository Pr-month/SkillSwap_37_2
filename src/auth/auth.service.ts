import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async getTokens(user: { id: number; email: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: 'USER',
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) || 604800,
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  private toPublicUser(user: { id: number; name: string; email: string }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async register(createAuthDto: CreateAuthDto) {
    const existingUser = await this.usersService.findByEmail(
      createAuthDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

    const user = await this.usersService.createFromAuth({
      ...createAuthDto,
      password: hashedPassword,
    });

    const userData = this.toPublicUser(user);
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

    const userData = this.toPublicUser(user);
    const tokens = await this.getTokens(userData);

    return {
      user: userData,
      tokens,
    };
  }

  async refresh(user: { id: number; email: string; role: string }) {
    const tokens = await this.getTokens(user);
    return { tokens };
  }

  async logout(userId: number) {
    await this.usersService.clearRefreshToken(userId);
    return { message: 'Вы успешно вышли из системы', userId };
  }
}
