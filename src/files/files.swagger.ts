import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export function ApiUploadFile() {
  return applyDecorators(
    ApiTags('Files'),
    ApiOperation({
      summary: 'Загрузка изображения',
      description:
        'Загружает на сервер изображения разрешенных типов: jpeg, png, gif, svg. Размер: от 2КБ до 2МБ.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            format: 'binary',
            description: 'Файл изображения для загрузки',
          },
        },
        required: ['image'],
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Возвращает путь к успешно загруженному файлу',
      schema: {
        type: 'string',
        example: '/public/550e8400-e29b-41d4-a716-446655440000.png',
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Ошибка валидации: неверный формат или файл слишком маленький (< 2KB)',
    }),
    ApiResponse({
      status: 413,
      description: 'Ошибка: Файл слишком большой (> 2MB)',
    }),
  );
}
