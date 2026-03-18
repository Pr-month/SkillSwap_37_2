import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

// Response DTOs
export class TokensResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refreshToken: string;
}

export class UserResponse {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID пользователя',
  })
  id: string;

  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя пользователя',
  })
  name: string;

  @ApiProperty({
    example: 'ivan@example.com',
    description: 'Email пользователя',
  })
  email: string;

  @ApiProperty({
    example: 'user',
    description: 'Роль пользователя',
    enum: ['user', 'admin', 'moderator'],
  })
  role: string;
}

export class AuthResponse {
  @ApiProperty({ type: () => UserResponse })
  user: UserResponse;

  @ApiProperty({ type: () => TokensResponse })
  tokens: TokensResponse;
}

export class RefreshResponse {
  @ApiProperty({ type: () => TokensResponse })
  tokens: TokensResponse;
}

export class LogoutResponse {
  @ApiProperty({
    example: 'Вы успешно вышли из системы',
    description: 'Сообщение об успешном выходе',
  })
  message: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID пользователя',
  })
  userId: string;
}

// Декораторы для эндпоинтов
export const ApiRegister = () =>
  applyDecorators(
    ApiOperation({ summary: 'Регистрация нового пользователя' }),
    ApiBody({ type: CreateAuthDto }),
    ApiCreatedResponse({
      description: 'Пользователь успешно зарегистрирован',
      type: AuthResponse,
    }),
    ApiBadRequestResponse({ description: 'Неверные данные запроса' }),
    ApiConflictResponse({
      description: 'Пользователь с таким email уже существует',
    }),
  );

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({ summary: 'Вход в систему' }),
    ApiBody({ type: LoginAuthDto }),
    ApiOkResponse({
      description: 'Успешный вход',
      type: AuthResponse,
    }),
    ApiUnauthorizedResponse({ description: 'Неверный email или пароль' }),
  );

export const ApiRefresh = () =>
  applyDecorators(
    ApiOperation({ summary: 'Обновление токенов' }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'Токены успешно обновлены',
      type: RefreshResponse,
    }),
    ApiUnauthorizedResponse({ description: 'Недействительный refresh токен' }),
  );

export const ApiLogout = () =>
  applyDecorators(
    ApiOperation({ summary: 'Выход из системы' }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'Успешный выход',
      type: LogoutResponse,
    }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
