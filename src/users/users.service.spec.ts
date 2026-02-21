import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return users list without passwords', () => {
    service.createFromAuth({
      name: 'User One',
      email: 'user1@example.com',
      password: 'hashed-password-1',
    });

    service.createFromAuth({
      name: 'User Two',
      email: 'user2@example.com',
      password: 'hashed-password-2',
    });

    const users = service.findAll();

    expect(users).toHaveLength(2);
    expect(users[0]).toEqual({
      id: 1,
      name: 'User One',
      email: 'user1@example.com',
    });
    expect(users[1]).toEqual({
      id: 2,
      name: 'User Two',
      email: 'user2@example.com',
    });
  });
});
