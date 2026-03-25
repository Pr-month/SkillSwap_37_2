import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'http';
import { AppModule } from '../src/app.module';
import { AppExceptionFilter } from '../src/common/all-exception.filter';
import { adminEmail, adminPassword } from 'src/scripts/seed-admin';

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

interface UsersListResponse {
  data: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userAccessToken: string;
  let adminAccessToken: string;
  let currentUserId: string;

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

    const userLoginResponse = await request(
      app.getHttpServer() as unknown as http.Server,
    )
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'password123',
      })
      .expect(201);

    userAccessToken = (userLoginResponse.body as LoginResponse).tokens
      .accessToken;
    currentUserId = (userLoginResponse.body as LoginResponse).user.id;

    expect(userAccessToken).toBeDefined();
    expect(currentUserId).toBeDefined();

    const adminLoginResponse = await request(
      app.getHttpServer() as unknown as http.Server,
    )
      .post('/auth/login')
      .send({
        email: adminEmail,

        password: adminPassword,
      })
      .expect(201);

    adminAccessToken = (adminLoginResponse.body as LoginResponse).tokens
      .accessToken;
    expect(adminAccessToken).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
  describe('GET /users', () => {
    it('should return paginated users list', async () => {
      const response = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .get('/users')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray((response.body as UsersListResponse).data)).toBe(
        true,
      );
      expect((response.body as UsersListResponse).meta).toHaveProperty('total');
      expect((response.body as UsersListResponse).meta).toHaveProperty('page');
      expect((response.body as UsersListResponse).meta).toHaveProperty('limit');
      expect((response.body as UsersListResponse).meta).toHaveProperty(
        'totalPages',
      );
    });

    it('should return 404 for non-existent page', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .get('/users')
        .query({ page: 999, limit: 10 })
        .expect(404);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .get(`/users/${currentUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', currentUserId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
    });

    it('should return 400 for invalid uuid', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .get('/users/not-a-uuid')
        .expect(400);
    });
  });

  describe('GET /users/me', () => {
    it('should return current user for authorized request', async () => {
      const response = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .get('/users/me')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', currentUserId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .get('/users/me')
        .expect(401);
    });
  });

  describe('PATCH /users/me/password', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .patch('/users/me/password')
        .send({
          oldPassword: 'password123',
          newPassword: 'newPassword123',
        })
        .expect(401);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user profile by id', async () => {
      const response = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .patch(`/users/${currentUserId}`)
        .send({
          name: 'Updated Test User',
          city: 'Amsterdam',
        })
        .expect(200);

      expect(response.body).toHaveProperty('id', currentUserId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
    });

    it('should return 400 for invalid uuid', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .patch('/users/not-a-uuid')
        .send({
          name: 'Updated Name',
        })
        .expect(400);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .delete(`/users/${currentUserId}`)
        .expect(401);
    });

    it('should forbid non-admin user', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .delete(`/users/${currentUserId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(403);
    });

    it('should return 400 for invalid uuid even for admin', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .delete('/users/not-a-uuid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(400);
    });
  });

  describe('GET /users/by-skill/:id', () => {
    it('should return 400 for invalid uuid', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .get('/users/by-skill/not-a-uuid')
        .expect(400);
    });

    it('should return 404 for non-existent skill', async () => {
      const nonExistentSkillId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer() as unknown as http.Server)
        .get(`/users/by-skill/${nonExistentSkillId}`)
        .expect(404);
    });

    it('should return users with given skill', async () => {
      // First, get a skill ID from the database via GET /skills
      const skillsResponse = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .get('/skills')
        .query({ limit: 1 })
        .expect(200);
      const skillId = (skillsResponse.body as { data: Array<{ id: string }> })
        .data[0]?.id;
      expect(skillId).toBeDefined();

      const response = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .get(`/users/by-skill/${skillId}`)
        .expect(200);

      const responseBody = response.body as Array<{
        id: string;
        name: string;
        email: string;
        role: string;
      }>;
      expect(responseBody).toBeInstanceOf(Array);
      expect(responseBody.length).toBeLessThanOrEqual(10);
      // Each user should have id, name, email, role, etc.
      if (responseBody.length > 0) {
        const user = responseBody[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
      }
    });
  });
});
