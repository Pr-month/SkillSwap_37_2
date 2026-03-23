import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    })
      .overrideGuard(JwtAccessGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    const dto = {
      name: 'Programming',
      parentId: null,
    };

    await controller.create(dto as any);

    expect(mockCategoriesService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findAll', async () => {
    await controller.findAll();

    expect(mockCategoriesService.findAll).toHaveBeenCalled();
  });

  it('should call findOne', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';

    await controller.findOne(id);

    expect(mockCategoriesService.findOne).toHaveBeenCalledWith(id);
  });

  it('should call update', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const dto = {
      name: 'Design',
    };

    await controller.update(id, dto as any);

    expect(mockCategoriesService.update).toHaveBeenCalledWith(id, dto);
  });

  it('should call remove', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';

    await controller.remove(id);

    expect(mockCategoriesService.remove).toHaveBeenCalledWith(id);
  });
});
