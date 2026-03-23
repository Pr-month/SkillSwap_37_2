import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserGender } from '../users/users.enums';

describe('AuthController', () => {
  let controller: AuthController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register', async () => {
    const dto = {
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
      about: 'About me',
      birthdate: new Date('2000-01-01'),
      city: 'Moscow',
      gender: UserGender.MALE,
      avatar: 'avatar.png',
    };
    const authService = module.get(AuthService);

    await controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('should call login', async () => {
    const dto = { email: 'test@example.com', password: '123456' };
    const authService = module.get(AuthService);

    await controller.login(dto);

    expect(authService.login).toHaveBeenLastCalledWith(dto);
  });
});
