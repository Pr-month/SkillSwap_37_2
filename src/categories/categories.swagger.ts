import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

const TAG = 'Categories';

export function ApiCreateCategory() {
  return applyDecorators(
    ApiTags(TAG),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать категорию',
      description: 'Доступно только пользователям с правами администратора',
    }),
    ApiResponse({ status: 201, description: 'Категория создана' }),
    ApiResponse({ status: 400, description: 'Ошибка валидации запроса' }),
    ApiResponse({ status: 403, description: 'Недостаточно прав' }),
  );
}

export function ApiGetCategory() {
  return applyDecorators(
    ApiTags(TAG),
    ApiOperation({ summary: 'Категория по идентификатору' }),
    ApiParam({ name: 'id', description: 'UUID категории' }),
    ApiResponse({ status: 200, description: 'Категория найдена' }),
    ApiResponse({ status: 404, description: 'Категория не найдена' }),
  );
}

export function ApiGetAllCategories() {
  return applyDecorators(
    ApiTags(TAG),
    ApiOperation({ summary: 'Список всех категорий' }),
    ApiResponse({ status: 200, description: 'Список категорий получен' }),
  );
}

export function ApiUpdateCategory() {
  return applyDecorators(
    ApiTags(TAG),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить категорию',
      description: 'Доступно только пользователям с правами администратора',
    }),
    ApiParam({ name: 'id', description: 'UUID категории' }),
    ApiResponse({ status: 200, description: 'Категория успешно обновлена' }),
    ApiResponse({ status: 403, description: 'Недостаточно прав' }),
    ApiResponse({ status: 404, description: 'Категория не найдена' }),
  );
}

export function ApiDeleteCategory() {
  return applyDecorators(
    ApiTags(TAG),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить категорию',
      description: 'Доступно только пользователям с правами администратора',
    }),
    ApiParam({ name: 'id', description: 'UUID категории' }),
    ApiResponse({ status: 200, description: 'Категория успешно удалена' }),
    ApiResponse({ status: 403, description: 'Недостаточно прав' }),
    ApiResponse({ status: 404, description: 'Категория не найдена' }),
  );
}
