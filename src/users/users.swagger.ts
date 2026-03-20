import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { UserGender, UserRole } from './users.enums';

export class UserResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Иван Иванов' })
  name: string;

  @ApiProperty({ example: 'ivan@example.com' })
  email: string;

  @ApiProperty({ example: 'Люблю программирование' })
  about: string;

  @ApiProperty({ example: '1990-01-01' })
  birthdate: Date;

  @ApiProperty({ example: 'Москва' })
  city: string;

  @ApiProperty({ enum: UserGender, example: UserGender.MALE })
  gender: UserGender;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatar: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;
}

export class UserWithPaginationResponse {
  @ApiProperty({ type: () => [UserResponse] })
  data: UserResponse[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export const ApiGetMe = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получить текущего пользователя' }),
    ApiBearerAuth(),
    ApiOkResponse({ type: UserResponse }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );

export const ApiUpdatePassword = () =>
  applyDecorators(
    ApiOperation({ summary: 'Изменить пароль' }),
    ApiBearerAuth(),
    ApiOkResponse({ description: 'Пароль успешно изменён' }),
    ApiBadRequestResponse({ description: 'Неверный старый пароль' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );

export const ApiUpdateMe = () =>
  applyDecorators(
    ApiOperation({ summary: 'Обновить профиль текущего пользователя' }),
    ApiBearerAuth(),
    ApiOkResponse({ type: UserResponse }),
    ApiNotFoundResponse({ description: 'Пользователь не найден' }),
    ApiBadRequestResponse({ description: 'Неверные данные запроса' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );

export const ApiFindAllUsers = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получить список пользователей' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 20 }),
    ApiOkResponse({ type: UserWithPaginationResponse }),
  );

export const ApiFindOneUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получить пользователя по ID' }),
    ApiParam({
      name: 'id',
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiOkResponse({ type: UserResponse }),
    ApiNotFoundResponse({ description: 'Пользователь не найден' }),
  );

export const ApiUpdateUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Обновить профиль пользователя' }),
    ApiParam({
      name: 'id',
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiOkResponse({ type: UserResponse }),
    ApiNotFoundResponse({ description: 'Пользователь не найден' }),
    ApiBadRequestResponse({ description: 'Неверные данные запроса' }),
  );

export const ApiDeleteUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Удалить пользователя' }),
    ApiParam({
      name: 'id',
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiNoContentResponse({ description: 'Пользователь удалён' }),
    ApiNotFoundResponse({ description: 'Пользователь не найден' }),
    ApiForbiddenResponse({ description: 'Недостаточно прав' }),
  );
