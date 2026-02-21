import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock; createFromAuth: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            createFromAuth: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login user and return tokens', async () => {
    const bcrypt = require('bcrypt');
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    usersService.findByEmail.mockReturnValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
    });

    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.login({
      email: 'test@example.com',
      password,
    });

    expect(result.user).toEqual({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(result.tokens).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });
});
