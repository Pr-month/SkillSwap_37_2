import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { jwtConfig } from '../config/jwt.config';
import { UnauthorizedException } from '@nestjs/common';
import { UserGender, UserRole } from '../users/users.enums';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { 
    findByEmail: jest.Mock; 
    createFromAuth: jest.Mock;
    updateRefreshToken: jest.Mock;
    verifyRefreshToken: jest.Mock;
    clearRefreshToken: jest.Mock; 
  };
  let jwtService: { signAsync: jest.Mock };

  const mockJwtConfig = {
    refreshExpiresIn: '7d',
    refreshToken: 'refresh-secret',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            createFromAuth: jest.fn(),
            updateRefreshToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
            clearRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: mockJwtConfig,
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
  it('should login user and return tokens', async () => {

    /*const bcrypt = require('bcrypt');
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);*/

    const user = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'USER',
    }

    usersService.findByEmail.mockResolvedValue(user);
    usersService.updateRefreshToken.mockResolvedValue(undefined);

    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-refresh-token'));


    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'password123',
      'hashedPassword',
    );

    expect(result.user).toEqual({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER'
    });
    expect(result.tokens).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('should return exception when user not found', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'password123',
      })
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return exaption when password is wrong', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'USER',
    });

    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'wrongPassword',
      })
    ).rejects.toThrow(UnauthorizedException);
  });
});

describe('register', () => {
  it('should register user and return tokens', async () => {
    usersService.createFromAuth.mockResolvedValue({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'USER',
    });
    usersService.updateRefreshToken.mockResolvedValue(undefined);

    jest
  .spyOn(bcrypt, 'hash')
  .mockImplementationOnce(() => Promise.resolve('hashed-password'))
  .mockImplementationOnce(() => Promise.resolve('hashed-refresh-token'));
    
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      about: 'About me',
      birthdate: new Date('2000-01-01'),
      city: 'Moscow',
      gender: UserGender.MALE,
      avatar: 'avatar.png',
    });

    expect(usersService.createFromAuth).toHaveBeenCalledWith({
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed-password',
  about: 'About me',
  birthdate: new Date('2000-01-01'),
  city: 'Moscow',
  gender: UserGender.MALE,
  avatar: 'avatar.png',
});

    expect(result.user).toEqual({
      id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
    });

    expect(result.tokens).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });
});

describe('refresh', () => {
  it('should refresh tokens when refresh token is valid', async () => {
    usersService.verifyRefreshToken.mockResolvedValue(true);
    usersService.updateRefreshToken.mockResolvedValue(undefined);

    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => Promise.resolve('hashed-refresh-token'));

    const result = await service.refresh({
        id: '1',
        email: 'test@example.com',
        role: UserRole.USER,
        refreshToken: 'valid-refresh-token',
      });

    expect(usersService.verifyRefreshToken).toHaveBeenCalledWith(
      '1',
      'valid-refresh-token'
    );

    expect(result.tokens).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('should throw exception when refresh token is wrong', async () => {
    usersService.verifyRefreshToken.mockResolvedValue(false);

    await expect(
      service.refresh({
        id: '1',
        email: 'test@example.com',
        role: UserRole.USER,
        refreshToken: 'bad-refresh-token',
      })
    ).rejects.toThrow(UnauthorizedException);
  });
});

describe('logout', () => {
  it('should clear refresh token and return success message', async () => {
    usersService.clearRefreshToken.mockResolvedValue(undefined);

    const result = await service.logout('1');

    expect(usersService.clearRefreshToken).toHaveBeenCalledWith('1');

    expect(result).toEqual({
      message: 'Вы успешно вышли из системы',
      userId: '1'
    });
  });
});

});
