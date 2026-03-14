import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { GetSkillsQueryDto } from './dto/get-skills-query.dto';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.enums';

describe('SkillsService', () => {
  let service: SkillsService;
  let mockRepository: any;

  const mockSkill = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Skill',
    description: 'Test Description',
    category: { id: 'category-id' },
    owner: { id: 'user-id', email: 'owner@example.com' },
    images: [],
  };

  const mockUser: JwtPayload = {
    sub: 'user-id',
    email: 'owner@example.com',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a skill', async () => {
      const createSkillDto: CreateSkillDto = {
        title: 'New Skill',
        description: 'Description',
        category: 'category-id',
        owner: 'user-id',
        images: [],
      };

      const expectedSkill = { ...mockSkill, ...createSkillDto };
      mockRepository.create.mockReturnValue(expectedSkill);
      mockRepository.save.mockResolvedValue(expectedSkill);

      const result = await service.create(createSkillDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createSkillDto,
        category: { id: createSkillDto.category },
        owner: { id: createSkillDto.owner },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedSkill);
      expect(result).toEqual(expectedSkill);
    });
  });

  describe('findAll', () => {
    it('should return paginated skills without search', async () => {
      const query: GetSkillsQueryDto = { page: 1, limit: 10 };
      const mockSkills = [mockSkill];
      const mockTotal = 1;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(mockTotal),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockSkills),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(query);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('skill');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('skill.owner', 'owner');
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: mockSkills,
        page: 1,
        totalPages: 1,
      });
    });

    it('should apply search filter', async () => {
      const query: GetSkillsQueryDto = { page: 1, limit: 10, search: 'test' };
      const mockSkills = [mockSkill];
      const mockTotal = 1;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(mockTotal),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockSkills),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(query);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('LOWER(skill.title) LIKE :search', {
        search: '%test%',
      });
    });

    it('should throw NotFoundException if page exceeds total pages', async () => {
      const query: GetSkillsQueryDto = { page: 5, limit: 10 };
      const mockTotal = 0;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(mockTotal),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.findAll(query)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a skill by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockSkill);

      const result = await service.findOne(mockSkill.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockSkill.id },
        relations: ['owner'],
      });
      expect(result).toEqual(mockSkill);
    });

    it('should throw NotFoundException if skill not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneAndCheckOwner', () => {
    it('should return true if skill exists and user is owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockSkill);

      const result = await service.findOneAndCheckOwner(mockSkill.id, mockUser);

      expect(result).toBe(true);
    });

    it('should throw NotFoundException if skill not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneAndCheckOwner('non-existent-id', mockUser))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const differentOwnerSkill = {
        ...mockSkill,
        owner: { id: 'other-id', email: 'other@example.com' },
      };
      mockRepository.findOne.mockResolvedValue(differentOwnerSkill);

      await expect(service.findOneAndCheckOwner(mockSkill.id, mockUser))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a skill if user is owner', async () => {
      const updateSkillDto: UpdateSkillDto = { title: 'Updated Title' };
      const skillWithOwner = {
        ...mockSkill,
        owner: { id: 'user-id' },
      };
      const updatedSkill = { ...skillWithOwner, ...updateSkillDto };

      mockRepository.findOne.mockResolvedValue(skillWithOwner);
      mockRepository.save.mockResolvedValue(updatedSkill);

      const result = await service.update(mockSkill.id, updateSkillDto, 'user-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockSkill.id },
        relations: ['owner'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedSkill);
      expect(result).toEqual(updatedSkill);
    });

    it('should throw NotFoundException if skill not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', {}, 'user-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const skillWithOtherOwner = {
        ...mockSkill,
        owner: { id: 'other-id' },
      };
      mockRepository.findOne.mockResolvedValue(skillWithOtherOwner);

      await expect(service.update(mockSkill.id, {}, 'user-id'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should return a message', () => {
      const result = service.remove('some-id');
      expect(result).toBe('This action removes a #some-id skill');
    });
  });
});
