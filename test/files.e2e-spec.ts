import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as path from 'path';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AppExceptionFilter } from '../src/common/all-exception.filter';

describe('FilesController (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /files/upload', () => {
    it('should upload valid image', async () => {
      const response = await request(app.getHttpServer())
        .post('/files/upload')
        .attach(
          'image',
          path.resolve(__dirname, 'fixtures', 'test-image.png'),
        )
        .expect(201);

      expect(typeof response.body).toBe('string');
      expect(response.body).toContain('/public/');
      expect(response.body).toMatch(/^\/public\/.+/);
    });

    it('should return 400 when file is not provided', async () => {
      await request(app.getHttpServer())
        .post('/files/upload')
        .expect(400);
    });

    it('should return 400 for invalid file type', async () => {
      await request(app.getHttpServer())
        .post('/files/upload')
        .attach(
          'image',
          path.resolve(__dirname, 'fixtures', 'not-image.txt'),
        )
        .expect(400);
    });

    it('should return 400 for too small file', async () => {
      await request(app.getHttpServer())
        .post('/files/upload')
        .attach(
          'image',
          path.resolve(__dirname, 'fixtures', 'tiny-image.png'),
        )
        .expect(400);
    });

    it('should return 413 for too large file', async () => {
      await request(app.getHttpServer())
        .post('/files/upload')
        .attach(
          'image',
          path.resolve(__dirname, 'fixtures', 'big-image.jpg'),
        )
        .expect(413);
    });
  });
});