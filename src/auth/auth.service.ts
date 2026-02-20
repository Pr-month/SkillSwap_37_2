import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UsersService } from '../users/users.service';

type PublicUser = {
  id: number;
  name: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async getTokens(user: PublicUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: 'USER',
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) || 604800,
    });

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
    const existingUser = this.usersService.findByEmail(createAuthDto.email);

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

    const user = this.usersService.createFromAuth({
      ...createAuthDto,
      password: hashedPassword,
    });

    const userData: PublicUser = this.toPublicUser(user);
    const tokens = await this.getTokens(userData);

    return {
      user: userData,
      tokens,
    };
  }
}
