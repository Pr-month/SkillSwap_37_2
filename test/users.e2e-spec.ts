import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import * as request from 'supertest';
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { AppExceptionFilter } from "../src/common/all-exception.filter";

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
  let app: INestApplication
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

    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'password123',
      })
      .expect(201);

    userAccessToken = (userLoginResponse.body as LoginResponse).tokens.accessToken;
    currentUserId = (userLoginResponse.body as LoginResponse).user.id;

    expect(userAccessToken).toBeDefined();
    expect(currentUserId).toBeDefined();

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      })
      .expect(201);

    adminAccessToken = (adminLoginResponse.body as LoginResponse).tokens.accessToken;
    expect(adminAccessToken).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
  describe('GET /users', () => {
    it('should return paginated users list', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray((response.body as UsersListResponse).data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should return 404 for non-existent page', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .query({ page: 999, limit: 10 })
        .expect(404);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${currentUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', currentUserId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
    });

    it('should return 400 for invalid uuid', async () => {
      await request(app.getHttpServer())
        .get('/users/not-a-uuid')
        .expect(400);
    });
  });

  describe('GET /users/me', () => {
    it('should return current user for authorized request', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', currentUserId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });
  });

  describe('PATCH /users/me/password', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
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
      const response = await request(app.getHttpServer())
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
      await request(app.getHttpServer())
        .patch('/users/not-a-uuid')
        .send({
          name: 'Updated Name',
        })
        .expect(400);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${currentUserId}`)
        .expect(401);
    });

    it('should forbid non-admin user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${currentUserId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(403);
    });

    it('should return 400 for invalid uuid even for admin', async () => {
      await request(app.getHttpServer())
        .delete('/users/not-a-uuid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(400);
    });
  });

});