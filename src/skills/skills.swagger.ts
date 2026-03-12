import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { GetSkillsQueryDto } from './dto/get-skills-query.dto';

// Response DTO with ApiProperty
export class SkillResponse {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID навыка',
  })
  id: string;

  @ApiProperty({
    example: 'Программирование на Python',
    description: 'Название навыка',
  })
  title: string;

  @ApiProperty({
    example: 'Обучаю основам Python и веб-разработке',
    description: 'Описание навыка',
  })
  description: string;

  @ApiProperty({
    description: 'Категория',
    type: () => Object,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Программирование',
    },
  })
  category: any;

  @ApiProperty({
    example: ['https://example.com/image1.jpg'],
    description: 'Ссылки на изображения',
  })
  images: string[];

  @ApiProperty({
    description: 'Владелец',
    type: () => Object,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Иван Иванов',
      email: 'ivan@example.com',
    },
  })
  owner: any;
}

// Функции для декораторов

export const ApiCreateSkill = () =>
  applyDecorators(
    ApiOperation({ summary: 'Создать новый навык' }),
    ApiBody({ type: CreateSkillDto }),
    ApiCreatedResponse({
      description: 'Навык успешно создан',
      type: SkillResponse,
    }),
    ApiBadRequestResponse({ description: 'Неверные данные запроса' }),
    ApiConflictResponse({
      description: 'Навык с таким названием уже существует',
    }),
  );

export const ApiFindAllSkills = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получить список навыков' }),
    ApiQuery({ type: GetSkillsQueryDto }),
    ApiOkResponse({
      description: 'Список навыков',
      type: [SkillResponse],
    }),
  );

export const ApiFindOneSkill = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получить навык по ID' }),
    ApiParam({
      name: 'id',
      description: 'ID навыка',
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiOkResponse({
      description: 'Навык найден',
      type: SkillResponse,
    }),
    ApiNotFoundResponse({ description: 'Навык не найден' }),
  );

export const ApiUpdateSkill = () =>
  applyDecorators(
    ApiOperation({ summary: 'Обновить навык' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'ID навыка',
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiBody({ type: UpdateSkillDto }),
    ApiOkResponse({
      description: 'Навык обновлен',
      type: SkillResponse,
    }),
    ApiNotFoundResponse({ description: 'Навык не найден' }),
    ApiBadRequestResponse({ description: 'Неверные данные запроса' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
    ApiForbiddenResponse({ description: 'Недостаточно прав для обновления' }),
  );

export const ApiDeleteSkill = () =>
  applyDecorators(
    ApiOperation({ summary: 'Удалить навык' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'ID навыка',
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiNoContentResponse({ description: 'Навык удален' }),
    ApiNotFoundResponse({ description: 'Навык не найден' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
    ApiForbiddenResponse({ description: 'Недостаточно прав для удаления' }),
  );

export const ApiAddFavoriteSkill = () =>
  applyDecorators(
    ApiOperation({ summary: 'Добавить навык в избранное' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'ID навыка',
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiOkResponse({ description: 'Навык добавлен в избранное' }),
    ApiNotFoundResponse({ description: 'Навык не найден' }),
    ApiConflictResponse({ description: 'Навык уже в избранном' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );

export const ApiRemoveFavoriteSkill = () =>
  applyDecorators(
    ApiOperation({ summary: 'Удалить навык из избранного' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'ID навыка',
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiOkResponse({ description: 'Навык удален из избранного' }),
    ApiNotFoundResponse({ description: 'Навык не найден' }),
    ApiConflictResponse({ description: 'Навык не был в избранном' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
