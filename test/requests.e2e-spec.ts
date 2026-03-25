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
import { RequestStatus } from '../src/requests/requests.enums';

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

interface RequestResponse {
  id: string;
  createdAt: string;
  status: RequestStatus;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
  };
  offeredSkill: {
    id: string;
    name: string;
  };
  requestedSkill: {
    id: string;
    name: string;
  };
}

interface SkillsListResponse {
  data: Array<{
    id: string;
    name: string;
    owner: { id: string };
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

describe('RequestsController (e2e)', () => {
  let app: INestApplication;
  let user1AccessToken: string;
  let user2AccessToken: string;
  let adminAccessToken: string;
  let user1Id: string;
  let user2Id: string;
  let skill1Id: string; // принадлежит user1
  let skill2Id: string; // принадлежит user2

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

    // Логин user1
    const user1LoginResponse = await request(
      app.getHttpServer() as unknown as http.Server,
    )
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'password123',
      })
      .expect(201);

    user1AccessToken = (user1LoginResponse.body as LoginResponse).tokens
      .accessToken;
    user1Id = (user1LoginResponse.body as LoginResponse).user.id;

    // Логин user2
    const user2LoginResponse = await request(
      app.getHttpServer() as unknown as http.Server,
    )
      .post('/auth/login')
      .send({
        email: 'user2@test.com',
        password: 'password123',
      })
      .expect(201);

    user2AccessToken = (user2LoginResponse.body as LoginResponse).tokens
      .accessToken;
    user2Id = (user2LoginResponse.body as LoginResponse).user.id;

    // Логин администратора
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

    // Получаем ID навыков, принадлежащих user1 и user2
    const skillsResponse = await request(
      app.getHttpServer() as unknown as http.Server,
    )
      .get('/skills')
      .query({ limit: 10 })
      .expect(200);

    const skills = (skillsResponse.body as SkillsListResponse).data;

    const user1Skill = skills.find((s) => s.owner.id === user1Id);
    const user2Skill = skills.find((s) => s.owner.id === user2Id);

    if (!user1Skill || !user2Skill) {
      throw new Error('Не удалось найти навыки для теста');
    }

    skill1Id = user1Skill.id;
    skill2Id = user2Skill.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /requests', () => {
    it('should create a request', async () => {
      const response = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .post('/requests')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({
          offeredSkillId: skill1Id,
          requestedSkillId: skill2Id,
        })
        .expect(201);

      const body = response.body as RequestResponse;
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('status', RequestStatus.PENDING);
      expect(body).toHaveProperty('sender');
      expect(body.sender).toHaveProperty('id', user1Id);
      expect(body).toHaveProperty('receiver');
      expect(body.receiver).toHaveProperty('id', user2Id);
      expect(body).toHaveProperty('offeredSkill');
      expect(body.offeredSkill).toHaveProperty('id', skill1Id);
      expect(body).toHaveProperty('requestedSkill');
      expect(body.requestedSkill).toHaveProperty('id', skill2Id);
    });

    it('should fail with same skill owner', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .post('/requests')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({
          offeredSkillId: skill1Id,
          requestedSkillId: skill1Id,
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .post('/requests')
        .send({
          offeredSkillId: skill1Id,
          requestedSkillId: skill2Id,
        })
        .expect(401);
    });

    it('should fail with invalid skill id', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .post('/requests')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({
          offeredSkillId: '00000000-0000-0000-0000-000000000000',
          requestedSkillId: skill2Id,
        })
        .expect(404);
    });
  });

  describe('GET /requests/incoming', () => {
    it('should return incoming requests', async () => {
      const response = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .get('/requests/incoming')
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(200);

      const body = response.body as RequestResponse[];
      expect(Array.isArray(body)).toBe(true);
      // Может быть пустым, но если есть, проверим структуру
      if (body.length > 0) {
        const request = body[0];
        expect(request).toHaveProperty('id');
        expect(request).toHaveProperty('status');
        expect(request).toHaveProperty('sender');
        expect(request).toHaveProperty('receiver');
        expect(request.receiver).toHaveProperty('id', user2Id);
      }
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .get('/requests/incoming')
        .expect(401);
    });
  });

  describe('GET /requests/outgoing', () => {
    it('should return outgoing requests', async () => {
      const response = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .get('/requests/outgoing')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      const body = response.body as RequestResponse[];
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        const request = body[0];
        expect(request).toHaveProperty('id');
        expect(request).toHaveProperty('status');
        expect(request).toHaveProperty('sender');
        expect(request.sender).toHaveProperty('id', user1Id);
      }
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .get('/requests/outgoing')
        .expect(401);
    });
  });

  describe('PATCH /requests/:id', () => {
    let requestId: string;

    beforeAll(async () => {
      // Пытаемся создать запрос; если уже существует, берем существующий
      const createResponse = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .post('/requests')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({
          offeredSkillId: skill1Id,
          requestedSkillId: skill2Id,
        });
      if (createResponse.status === 201) {
        requestId = (createResponse.body as RequestResponse).id;
      } else {
        // Если запрос уже существует, получим ID из списка исходящих запросов
        const outgoingResponse = await request(
          app.getHttpServer() as unknown as http.Server,
        )
          .get('/requests/outgoing')
          .set('Authorization', `Bearer ${user1AccessToken}`)
          .expect(200);
        const outgoing = outgoingResponse.body as RequestResponse[];
        const existing = outgoing.find(
          (req) =>
            req.offeredSkill.id === skill1Id &&
            req.requestedSkill.id === skill2Id,
        );
        if (!existing) {
          throw new Error('Не удалось найти или создать запрос для теста');
        }
        requestId = existing.id;
      }
    });

    it('should update request status (receiver)', async () => {
      const response = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .patch(`/requests/${requestId}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send({
          status: RequestStatus.ACCEPTED,
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', RequestStatus.ACCEPTED);
    });

    it('should fail if sender tries to update', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .patch(`/requests/${requestId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({
          status: RequestStatus.REJECTED,
        })
        .expect(403);
    });

    it('should fail with invalid status', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .patch(`/requests/${requestId}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send({
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .patch(`/requests/${requestId}`)
        .send({
          status: RequestStatus.ACCEPTED,
        })
        .expect(401);
    });
  });

  describe('DELETE /requests/:id', () => {
    let requestId: string;

    beforeEach(async () => {
      // Удаляем существующий запрос между этими навыками, если есть
      const outgoingResponse = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .get('/requests/outgoing')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);
      const outgoing = outgoingResponse.body as RequestResponse[];
      const existing = outgoing.find(
        (req) =>
          req.offeredSkill.id === skill1Id &&
          req.requestedSkill.id === skill2Id,
      );
      if (existing) {
        await request(app.getHttpServer() as unknown as http.Server)
          .delete(`/requests/${existing.id}`)
          .set('Authorization', `Bearer ${user1AccessToken}`)
          .expect(200);
      }
      // Создаем новый запрос для удаления
      const createResponse = await request(
        app.getHttpServer() as unknown as http.Server,
      )
        .post('/requests')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({
          offeredSkillId: skill1Id,
          requestedSkillId: skill2Id,
        })
        .expect(201);
      requestId = (createResponse.body as RequestResponse).id;
    });

    it('should delete request (sender)', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .delete(`/requests/${requestId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);
    });

    it('should delete request (admin)', async () => {
      // используем существующий запрос, созданный в beforeEach
      await request(app.getHttpServer() as unknown as http.Server)
        .delete(`/requests/${requestId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);
    });

    it('should fail if receiver tries to delete', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .delete(`/requests/${requestId}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(403);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer() as unknown as http.Server)
        .delete(`/requests/${requestId}`)
        .expect(401);
    });
  });
});
