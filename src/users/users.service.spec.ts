import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

// import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { appConfig } from '../config/app.config';
// import * as bcrypt from 'bcrypt';
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

  const mockConfig = {
    hashSalt: 10,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: appConfig.KEY,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('changePassword', () => {
    it('should change password when old password is correct', async () => {
      const user = {
        id: 1,
        name: 'Test',
        email: 'test@test.com',
        password: 'oldHash',
      };
      mockRepository.findOneBy.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'newHash');

      const result = await service.changePassword(1, {
        oldPassword: 'oldPass',
        newPassword: 'newPass123',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('oldPass', 'oldHash');
      expect(bcrypt.hash).toHaveBeenCalledWith(
        'newPass123',
        mockConfig.hashSalt,
      );
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: 'Test', email: 'test@test.com' });
    });

    it('should throw BadRequestException when old password is wrong', async () => {
      const user = {
        id: 1,
        name: 'Test',
        email: 'test@test.com',
        password: 'oldHash',
      };
      mockRepository.findOneBy.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        service.changePassword(1, {
          oldPassword: 'wrongPass',
          newPassword: 'newPass123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.changePassword(999, {
          oldPassword: 'oldPass',
          newPassword: 'newPass123',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
