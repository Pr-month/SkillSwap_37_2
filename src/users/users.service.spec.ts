import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole, UserGender } from './users.enums';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    about: 'About me',
    city: 'City',
    birthdate: new Date('2000-01-01'),
    gender: UserGender.MALE,
    avatar: 'avatar.png',
    role: UserRole.USER,
    refreshToken: null,
    skills: [],
    hashPassword: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should update user profile fields', async () => {
      const updateDto = {
        about: 'New about',
        city: 'New City',
      };

      const updatedUser = { ...mockUser, ...updateDto };

      mockRepository.findOneBy.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(1, updateDto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      // Verify save is called with merged object or updated object
      // Object.assign modifies mockUser in place!
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockUser,
          ...updateDto,
        }),
      );

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should return null if user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      const result = await service.updateProfile(999, {});
      expect(result).toBeNull();
    });
  });
});
