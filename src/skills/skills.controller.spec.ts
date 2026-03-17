import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { UsersService } from '../users/users.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { GetSkillsQueryDto } from './dto/get-skills-query.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { TAuthRequest } from '../auth/auth.types';

jest.mock('../users/users.service', () => ({
  UsersService: jest.fn().mockImplementation(() => ({
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  })),
}));

describe('SkillsController', () => {
  let controller: SkillsController;

  const mockSkillsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOneAndCheckOwner: jest.fn(),
  };

  const mockUsersService = {
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  };

  const mockRequest = {
    user: {
      sub: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    },
  } as TAuthRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        {
          provide: SkillsService,
          useValue: mockSkillsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAccessGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<SkillsController>(SkillsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a skill', async () => {
      const createSkillDto: CreateSkillDto = {
        title: 'New Skill',
        description: 'Description',
        category: 'category-id',
        images: [],
      };
      const expectedResult = {
        id: 'skill-id',
        ...createSkillDto,
        owner: { id: 'user-id' },
      };
      mockSkillsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createSkillDto, mockRequest);

      expect(mockSkillsService.create).toHaveBeenCalledWith(
        createSkillDto,
        mockRequest.user.sub,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated skills', async () => {
      const query: GetSkillsQueryDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: [{ id: 'skill-id', title: 'Skill' }],
        page: 1,
        totalPages: 1,
      };
      mockSkillsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(mockSkillsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a skill by id', async () => {
      const skillId = 'skill-id';
      const expectedSkill = { id: skillId, title: 'Skill' };
      mockSkillsService.findOne.mockResolvedValue(expectedSkill);

      const result = await controller.findOne(skillId);

      expect(mockSkillsService.findOne).toHaveBeenCalledWith(skillId);
      expect(result).toEqual(expectedSkill);
    });
  });

  describe('update', () => {
    it('should update a skill', async () => {
      const skillId = 'skill-id';
      const updateSkillDto: UpdateSkillDto = { title: 'Updated Title' };
      const expectedSkill = { id: skillId, ...updateSkillDto };
      mockSkillsService.update.mockResolvedValue(expectedSkill);

      const result = await controller.update(
        skillId,
        updateSkillDto,
        mockRequest,
      );

      expect(mockSkillsService.update).toHaveBeenCalledWith(
        skillId,
        updateSkillDto,
        mockRequest.user.sub,
      );
      expect(result).toEqual(expectedSkill);
    });
  });

  describe('remove', () => {
    it('should remove a skill', async () => {
      const skillId = 'skill-id';
      mockSkillsService.findOneAndCheckOwner.mockResolvedValue(true);
      mockSkillsService.remove.mockReturnValue(
        `This action removes a #${skillId} skill`,
      );

      const result = await controller.remove(skillId, mockRequest);

      expect(mockSkillsService.findOneAndCheckOwner).toHaveBeenCalledWith(
        skillId,
        mockRequest.user,
      );
      expect(mockSkillsService.remove).toHaveBeenCalledWith(skillId);
      expect(result).toBe(`This action removes a #${skillId} skill`);
    });
  });

  describe('addFavorite', () => {
    it('should add favorite', async () => {
      const skillId = 'skill-id';
      const expectedResult = { message: 'Added to favorites' };
      mockUsersService.addFavorite.mockResolvedValue(expectedResult);

      const result = await controller.addFavorite(skillId, mockRequest);

      expect(mockUsersService.addFavorite).toHaveBeenCalledWith(
        skillId,
        mockRequest.user.sub,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite', async () => {
      const skillId = 'skill-id';
      const expectedResult = { message: 'Removed from favorites' };
      mockUsersService.removeFavorite.mockResolvedValue(expectedResult);

      const result = await controller.removeFavorite(skillId, mockRequest);

      expect(mockUsersService.removeFavorite).toHaveBeenCalledWith(
        skillId,
        mockRequest.user.sub,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
