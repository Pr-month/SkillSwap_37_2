import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const TAG = 'Requests';

export function ApiCreateRequest() {
  return applyDecorators(
    ApiTags(TAG),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Создать заявку' }),
    ApiResponse({ status: 201, description: 'Заявка создана' }),
    ApiResponse({ status: 400, description: 'Ошибка валидации данных' }),
  );
}

export function ApiUpdateStatusRequest() {
  return applyDecorators(
    ApiTags(TAG),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Обновить статус заявки' }),
    ApiParam({ name: 'id', description: 'UUID заявки', format: 'uuid' }),
    ApiResponse({ status: 200, description: 'Статус обновлен' }),
    ApiResponse({ status: 404, description: 'Заявка не найдена' }),
  );
}

export function ApiGetIncomingRequests() {
  return applyDecorators(
    ApiTags(TAG),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Список входящих заявок' }),
    ApiResponse({ status: 200, description: 'Список входящих заявок получен' }),
  );
}

export function ApiGetOutgoingRequests() {
  return applyDecorators(
    ApiTags(TAG),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Список исходящих заявок' }),
    ApiResponse({
      status: 200,
      description: 'Список исходящих заявок получен',
    }),
  );
}

export function ApiDeleteRequest() {
  return applyDecorators(
    ApiTags(TAG),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Удалить заявку' }),
    ApiParam({ name: 'id', description: 'UUID заявки' }),
    ApiResponse({ status: 200, description: 'Заявка удалена' }),
    ApiResponse({ status: 403, description: 'Не достаточно прав' }),
    ApiResponse({ status: 404, description: 'Заявка не найдена' }),
  );
}
