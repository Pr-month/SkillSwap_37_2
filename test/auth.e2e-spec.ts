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

interface AuthResponse {
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

interface RefreshResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface LogoutResponse {
  message: string;
  userId: string;
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: http.Server;
  let accessToken: string;
  let refreshToken: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const response = await request(server)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'password123',
          about: 'About me',
          birthdate: '1990-01-01',
          city: 'Moscow',
          gender: 'MALE',
          avatar: 'https://example.com/avatar.jpg',
        })
        .expect(201);

      const body = response.body as AuthResponse;
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id');
      expect(body.user.email).toBe(uniqueEmail);
      expect(body.user.name).toBe('Test User');
      expect(body.user.role).toBe('USER');
      expect(body).toHaveProperty('tokens');
      expect(body.tokens).toHaveProperty('accessToken');
      expect(body.tokens).toHaveProperty('refreshToken');
    });

    it('should fail with invalid data', async () => {
      await request(server)
        .post('/auth/register')
        .send({
          name: '', // invalid
          email: 'invalid-email',
          password: 'short',
        })
        .expect(400);
    });

    it('should fail if email already exists', async () => {
      // Используем email, который уже существует в сидинге
      await request(server)
        .post('/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'user1@test.com',
          password: 'password123',
          about: 'About',
          birthdate: '1990-01-01',
          city: 'Moscow',
          gender: 'MALE',
          avatar: 'https://example.com/avatar.jpg',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with correct credentials', async () => {
      const response = await request(server)
        .post('/auth/login')
        .send({
          email: 'user1@test.com',
          password: 'password123',
        })
        .expect(201);

      const body = response.body as AuthResponse;
      expect(body).toHaveProperty('user');
      expect(body.user.email).toBe('user1@test.com');
      expect(body).toHaveProperty('tokens');
      accessToken = body.tokens.accessToken;
      refreshToken = body.tokens.refreshToken;
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      await request(server)
        .post('/auth/login')
        .send({
          email: 'user1@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      await request(server)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // Предполагаем, что refreshToken получен из предыдущего логина
      const response = await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(201);

      const body = response.body as RefreshResponse;
      expect(body).toHaveProperty('tokens');
      expect(body.tokens).toHaveProperty('accessToken');
      expect(body.tokens).toHaveProperty('refreshToken');
      // Обновляем токены для последующих тестов
      accessToken = body.tokens.accessToken;
      refreshToken = body.tokens.refreshToken;
    });

    it('should fail without refresh token', async () => {
      await request(server).post('/auth/refresh').expect(401);
    });

    it('should fail with invalid refresh token', async () => {
      await request(server)
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout with valid access token', async () => {
      await request(server)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          const body = res.body as LogoutResponse;
          expect(body).toHaveProperty('message', 'Вы успешно вышли из системы');
          expect(body).toHaveProperty('userId');
        });
    });

    it('should fail without access token', async () => {
      await request(server).post('/auth/logout').expect(401);
    });

    it('should fail with invalid access token', async () => {
      await request(server)
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });
  });
});
