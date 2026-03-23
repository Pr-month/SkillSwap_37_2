import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import * as http from 'http';
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

interface CategoryResponse {
  id: string;
  name: string;
  parent: CategoryResponse | null;
  children: CategoryResponse[];
}

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let server: http.Server;
  let accessToken: string;
  let adminAccessToken: string;

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
    server = app.getHttpServer() as http.Server;

    // Логин обычного пользователя для получения токена (используем данные из сидинга)
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'password123',
      })
      .expect(201);

    accessToken = (loginResponse.body as LoginResponse).tokens.accessToken;
    expect(accessToken).toBeDefined();

    // Логин администратора для операций, требующих прав ADMIN
    const adminLoginResponse = await request(server)
      .post('/auth/login')
      .send({
        email: 'admin@admin.ru',
        password: 'admin1234',
      })
      .expect(201);

    adminAccessToken = (adminLoginResponse.body as LoginResponse).tokens
      .accessToken;
    expect(adminAccessToken).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /categories', () => {
    it('should return all categories', async () => {
      const response = await request(server).get('/categories').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const body = response.body as CategoryResponse[];
      if (body.length > 0) {
        const category = body[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('parent');
        expect(category).toHaveProperty('children');
      }
    });
  });

  describe('GET /categories/:id', () => {
    it('should return a category by id', async () => {
      // Сначала получим список, чтобы взять существующий ID
      const listResponse = await request(server).get('/categories').expect(200);

      const listBody = listResponse.body as CategoryResponse[];
      if (listBody.length > 0) {
        const categoryId = listBody[0].id;
        const response = await request(server)
          .get(`/categories/${categoryId}`)
          .expect(200);

        const category = response.body as CategoryResponse;
        expect(category).toHaveProperty('id', categoryId);
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('parent');
        expect(category).toHaveProperty('children');
      } else {
        // Если категорий нет, пропускаем тест
        console.warn('No categories found, skipping test');
      }
    });

    it('should return 404 for non-existent id', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(server).get(`/categories/${nonExistentId}`).expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(server).get('/categories/invalid-uuid').expect(400);
    });
  });

  describe('POST /categories', () => {
    it('should create a new category (admin only)', async () => {
      const uniqueName = `Test Category ${Date.now()}`;
      const response = await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: uniqueName,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', uniqueName);
      expect(response.body).toHaveProperty('parent', null);
      expect(response.body).toHaveProperty('children', []);
    });

    it('should create a category with parentId', async () => {
      // Сначала создадим родительскую категорию
      const parentName = `Parent Category ${Date.now()}`;
      const parentResponse = await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: parentName })
        .expect(201);

      const parentId = (parentResponse.body as CategoryResponse).id;

      const childName = `Child Category ${Date.now()}`;
      const response = await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: childName,
          parentId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', childName);
      expect(response.body).toHaveProperty('parent');
      expect((response.body as CategoryResponse).parent).toHaveProperty(
        'id',
        parentId,
      );
    });

    it('should fail with duplicate name', async () => {
      const duplicateName = `Duplicate Category ${Date.now()}`;
      // Первое создание
      await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: duplicateName })
        .expect(201);

      // Второе создание с тем же именем
      await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: duplicateName })
        .expect(409);
    });

    it('should fail with invalid data (short name)', async () => {
      await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: 'ab' }) // меньше 3 символов
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(server)
        .post('/categories')
        .send({ name: 'Some Category' })
        .expect(401);
    });

    it('should fail with non-admin role', async () => {
      await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`) // обычный пользователь
        .send({ name: 'Some Category' })
        .expect(403);
    });
  });

  describe('PATCH /categories/:id', () => {
    let categoryId: string;

    beforeAll(async () => {
      // Создаём категорию для обновления
      const response = await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: `To Update ${Date.now()}` })
        .expect(201);
      categoryId = (response.body as CategoryResponse).id;
    });

    it('should update category name (admin only)', async () => {
      const newName = `Updated Category ${Date.now()}`;
      const response = await request(server)
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: newName })
        .expect(200);

      expect(response.body).toHaveProperty('id', categoryId);
      expect(response.body).toHaveProperty('name', newName);
    });

    it('should update parentId', async () => {
      // Создаём новую родительскую категорию
      const parentResponse = await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: `New Parent ${Date.now()}` })
        .expect(201);
      const parentId = (parentResponse.body as CategoryResponse).id;

      const response = await request(server)
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ parentId })
        .expect(200);

      expect(response.body).toHaveProperty('parent');
      expect((response.body as CategoryResponse).parent).toHaveProperty(
        'id',
        parentId,
      );
    });

    it('should fail with duplicate name', async () => {
      // Создаём другую категорию с уникальным именем
      const otherName = `Other Category ${Date.now()}`;
      await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: otherName })
        .expect(201);

      // Пытаемся обновить первую категорию на это же имя
      await request(server)
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: otherName })
        .expect(409);
    });

    it('should fail without authentication', async () => {
      await request(server)
        .patch(`/categories/${categoryId}`)
        .send({ name: 'Unauthorized Update' })
        .expect(401);
    });

    it('should fail with non-admin role', async () => {
      await request(server)
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'User Update' })
        .expect(403);
    });

    it('should return 404 for non-existent category', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(server)
        .patch(`/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /categories/:id', () => {
    let categoryId: string;

    beforeEach(async () => {
      // Создаём категорию для удаления
      const response = await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: `To Delete ${Date.now()}` })
        .expect(201);
      categoryId = (response.body as CategoryResponse).id;
    });

    it('should delete category (admin only)', async () => {
      await request(server)
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      // Проверяем, что категория больше не доступна
      await request(server).get(`/categories/${categoryId}`).expect(404);
    });

    it('should fail without authentication', async () => {
      await request(server).delete(`/categories/${categoryId}`).expect(401);
    });

    it('should fail with non-admin role', async () => {
      await request(server)
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent category', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(server)
        .delete(`/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });
});
