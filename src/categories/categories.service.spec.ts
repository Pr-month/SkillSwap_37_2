import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create category without parent', async () => {
      const dto = { name: 'Programming' };
      const category = { id: '1', name: 'Programming' };

      mockCategoryRepository.create.mockReturnValue(category);
      mockCategoryRepository.save.mockResolvedValue(category);

      const result = await service.create(dto as any);

      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        name: 'Programming',
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);
      expect(result).toEqual(category);
    });

    it('should create category with parent', async () => {
      const dto = { name: 'Drums', parentId: 'parent-1' };
      const parent = { id: 'parent-1', name: 'Music' };
      const category = { id: '1', name: 'Drums', parent: null as any };

      mockCategoryRepository.create.mockReturnValue(category);
      mockCategoryRepository.findOneBy.mockResolvedValue(parent);
      mockCategoryRepository.save.mockResolvedValue({
        ...category,
        parent,
      });

      const result = await service.create(dto as any);

      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({
        id: 'parent-1',
      });
      expect(category.parent).toBe(parent);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);
      expect(result).toEqual({
        ...category,
        parent,
      });
    });

    it('should throw NotFoundException when parent not found', async () => {
      const dto = { name: 'Drums', parentId: 'parent-1' };
      const category = { id: '1', name: 'Drums', parent: null as any };

      mockCategoryRepository.create.mockReturnValue(category);
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      await expect(service.create(dto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return root categories', async () => {
      const categories = [{ id: '1', name: 'Programming' }];

      mockCategoryRepository.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(mockCategoryRepository.find).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return category by id', async () => {
      const category = { id: '1', name: 'Programming', parent: null };

      mockCategoryRepository.findOne.mockResolvedValue(category);

      const result = await service.findOne('1');

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['parent'],
      });
      expect(result).toEqual(category);
    });
  });

  describe('remove', () => {
    it('should remove category', async () => {
      const category = { id: '1', name: 'Programming' };

      mockCategoryRepository.findOneBy.mockResolvedValue(category);
      mockCategoryRepository.remove.mockResolvedValue(category);

      await service.remove('1');

      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({
        id: '1',
      });
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(category);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update category name', async () => {
      const category = {
        id: '1',
        name: 'Old Name',
        parent: null,
      };
      const dto = { name: 'New Name' };

      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockCategoryRepository.findOneBy.mockResolvedValue(null);
      mockCategoryRepository.save.mockResolvedValue({
        ...category,
        name: 'New Name',
      });

      const result = await service.update('1', dto as any);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['parent'],
      });

      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({
        name: 'New Name',
      });

      expect(mockCategoryRepository.save).toHaveBeenCalledWith({
        id: '1',
        name: 'New Name',
        parent: null,
      });

      expect(result).toEqual({
        id: '1',
        name: 'New Name',
        parent: null,
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('1', { name: 'New Name' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when name already exists', async () => {
      const category = {
        id: '1',
        name: 'Old Name',
        parent: null,
      };

      const dto = {
        name: 'New Name',
      };

      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockCategoryRepository.findOneBy.mockResolvedValue({
        id: '2',
        name: 'New Name',
      });

      await expect(service.update('1', dto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException when category is its own parent', async () => {
      const category = {
        id: '1',
        name: 'Old Name',
        parent: null,
      };

      const dto = {
        parentId: '1',
      };

      mockCategoryRepository.findOne.mockResolvedValue(category);

      await expect(service.update('1', dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
