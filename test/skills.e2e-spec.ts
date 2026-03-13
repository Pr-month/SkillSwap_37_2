import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Skill } from '../src/skills/entities/skill.entity';
import { User } from '../src/users/entities/user.entity';
import { Category } from '../src/categories/entities/category.entity';

describe('SkillsController (e2e)', () => {
  let app: INestApplication;
  let skillRepository: any;
  let userRepository: any;
  let categoryRepository: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Skill))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getCount: jest.fn(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getMany: jest.fn(),
        })),
      })
      .overrideProvider(getRepositoryToken(User))
      .useValue({
        findOne: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(Category))
      .useValue({
        findOne: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    skillRepository = moduleFixture.get(getRepositoryToken(Skill));
    userRepository = moduleFixture.get(getRepositoryToken(User));
    categoryRepository = moduleFixture.get(getRepositoryToken(Category));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /skills', () => {
    it('should return paginated skills', async () => {
      const mockSkills = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Skill 1',
          description: 'Description 1',
          images: [],
          owner: { id: 'user-id', email: 'owner@example.com' },
          category: { id: 'category-id', name: 'Category' },
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Test Skill 2',
          description: 'Description 2',
          images: [],
          owner: { id: 'user-id', email: 'owner@example.com' },
          category: { id: 'category-id', name: 'Category' },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockSkills),
      };
      skillRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const response = await request(app.getHttpServer())
        .get('/skills')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toEqual({
        data: mockSkills,
        page: 1,
        totalPages: 1,
      });
    });

    it('should apply search filter', async () => {
      const mockSkills = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'JavaScript',
          description: 'JS programming',
          images: [],
          owner: { id: 'user-id', email: 'owner@example.com' },
          category: { id: 'category-id', name: 'Category' },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockSkills),
      };
      skillRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await request(app.getHttpServer())
        .get('/skills')
        .query({ search: 'java' })
        .expect(200);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(skill.title) LIKE :search',
        { search: '%java%' },
      );
    });
  });

  describe('GET /skills/:id', () => {
    it('should return a skill by id', async () => {
      const mockSkill = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Skill',
        description: 'Description',
        images: [],
        owner: { id: 'user-id', email: 'owner@example.com' },
        category: { id: 'category-id', name: 'Category' },
      };

      skillRepository.findOne.mockResolvedValue(mockSkill);

      const response = await request(app.getHttpServer())
        .get('/skills/550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(response.body).toEqual(mockSkill);
    });

    it('should return 404 if skill not found', async () => {
      skillRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/skills/non-existent-id')
        .expect(404);
    });
  });

  // Остальные endpoints требуют аутентификации, для простоты пропустим или добавим мок JWT
});