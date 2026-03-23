import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AppExceptionFilter } from '../src/common/all-exception.filter';

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface PaginatedSkillsResponse {
  data: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  page: number;
  totalPages: number;
}

interface ErrorResponse {
  message: string;
}

describe('SkillsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.useGlobalFilters(new AppExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    // Логин для получения токена (используем данные из сидинга)
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'password123',
      })
      .expect(201);

    accessToken = (loginResponse.body as LoginResponse).tokens.accessToken;
    expect(accessToken).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /skills', () => {
    it('should return paginated skills', async () => {
      const response = await request(app.getHttpServer())
        .get('/skills')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
      expect(
        Array.isArray((response.body as PaginatedSkillsResponse).data),
      ).toBe(true);
    });

    it('should apply search filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/skills')
        .query({ search: 'javascript' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      // Может вернуть пустой массив, если нет совпадений, но статус 200
    });

    it('should return 404 for non-existent page', async () => {
      // Предположим, что totalPages маленькое, а page большое
      const response = await request(app.getHttpServer())
        .get('/skills')
        .query({ page: 999, limit: 10 })
        .expect(404);

      expect((response.body as ErrorResponse).message).toContain(
        'Страница 999 не найдена',
      );
    });
  });

  describe('GET /skills/:id', () => {
    it('should return a skill by id', async () => {
      // Сначала получим список, чтобы взять существующий ID
      const listResponse = await request(app.getHttpServer())
        .get('/skills')
        .query({ limit: 1 })
        .expect(200);

      if ((listResponse.body as PaginatedSkillsResponse).data.length > 0) {
        const skillId = (listResponse.body as PaginatedSkillsResponse).data[0]
          .id;
        const response = await request(app.getHttpServer())
          .get(`/skills/${skillId}`)
          .expect(200);

        expect(response.body).toHaveProperty('id', skillId);
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('description');
      } else {
        // Если навыков нет, пропускаем тест
        console.warn('No skills found, skipping test');
      }
    });

    it('should return 404 for non-existent id', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/skills/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('Endpoints that require authentication', () => {
    it('PATCH /skills/:id should require authentication', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/skills')
        .query({ limit: 1 })
        .expect(200);

      if ((listResponse.body as PaginatedSkillsResponse).data.length > 0) {
        const skillId = (listResponse.body as PaginatedSkillsResponse).data[0]
          .id;
        await request(app.getHttpServer())
          .patch(`/skills/${skillId}`)
          .send({ title: 'Updated Title' })
          .expect(401);
      }
    });
  });
});
