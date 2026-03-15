import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { appConfig } from '../config/app.config';
import * as bcrypt from 'bcrypt';
import { UserRole, UserGender } from './users.enums';

describe('UsersService', () => {
  let service: UsersService;

  /*const mockUser = {
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
  };*/

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  const mockSkillRepository = {
    findOneBy: jest.fn(),
  };

  const mockConfig = {
    hashSalt: 10,
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
        {
          provide: getRepositoryToken(Skill),
          useValue: mockSkillRepository,
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

      const result = await service.changePassword('1', {
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
        service.changePassword('1', {
          oldPassword: 'wrongPass',
          newPassword: 'newPass123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.changePassword('999', {
          oldPassword: 'oldPass',
          newPassword: 'newPass123',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      const user = {
        id: 1,
        name: 'Test',
        email: 'test@test.com',
        password: 'oldHash',
        role: 'USER',
      };
      mockRepository.findOneBy.mockResolvedValue(user);
      const result = await service.findOne('1');

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual({
        id: 1,
        name: 'Test',
        email: 'test@test.com',
        role: 'USER',
      });
    });

      it('should return null when user not found', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);

    const result = await service.findOne('999');

    expect(result).toBeNull();
  });
  });

  describe('create', () => {
  it('should create user', async () => {
    const dto = {
      name: 'Test',
      email: 'test@test.com',
      password: 'pass123',
    };

    const createdUser = {
      id: 1,
      ...dto,
      role: 'USER',
    };

    mockRepository.create.mockReturnValue(createdUser);
    mockRepository.save.mockResolvedValue(createdUser);

    const result = await service.create(dto as any);

    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result).toEqual({
      id: 1,
      name: 'Test',
      email: 'test@test.com',
      role: 'USER',
    });
  });
});

describe('remove', () => {
  it('should remove user', async () => {
    const user = {
      id: 1,
      name: 'Test',
      email: 'test@test.com',
      role: 'USER',
    };

    mockRepository.findOneBy.mockResolvedValue(user);
    mockRepository.remove.mockResolvedValue(user);

    const result = await service.remove('1');

    expect(mockRepository.remove).toHaveBeenCalledWith(user);
    expect(result).toEqual({
      id: 1,
      name: 'Test',
      email: 'test@test.com',
      role: 'USER',
    });
  });

  it('should return null when user not found', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);

    const result = await service.remove('999');

    expect(result).toBeNull();
  });
});
});
