import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RequestStatus } from './requests.enums';
import { UserRole } from '../users/users.enums';
import { NotificationsService } from '../notifications/notifications.service';

describe('RequestsService', () => {
  let service: RequestsService;
  let requestRepo: Repository<Request>;
  let skillRepo: Repository<Skill>;
  let notificationsService: NotificationsService;

  const mockRequestRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockSkillRepo = {
    findOne: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({ id: 'notification-1' }),
    notifyUserRequestStatus: jest.fn().mockReturnValue(true),
  };

  const mockUserRepo = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        { provide: getRepositoryToken(Request), useValue: mockRequestRepo },
        { provide: getRepositoryToken(Skill), useValue: mockSkillRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
    requestRepo = module.get(getRepositoryToken(Request));
    skillRepo = module.get(getRepositoryToken(Skill));
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      offeredSkillId: 'skill-1',
      requestedSkillId: 'skill-2',
    };

    it('Если навык не найден, выдаём NotFoundException', async () => {
      mockSkillRepo.findOne.mockResolvedValueOnce(null);
      mockSkillRepo.findOne.mockResolvedValueOnce({});
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Если отправитель является получателем, выдаём BadRequestException', async () => {
      const mockSkill = { id: 'skill-1', owner: { id: 'user1' } };
      mockSkillRepo.findOne.mockResolvedValue(mockSkill);

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Невозможно отправить заявку самому себе'),
      );
    });

    it('Создание заказа, если ошибок нет', async () => {
      mockSkillRepo.findOne
        .mockResolvedValueOnce({ id: 'skill-1', owner: { id: 'user1' } })
        .mockResolvedValueOnce({ id: 'skill-2', owner: { id: 'user2' } });

      mockRequestRepo.findOne.mockResolvedValue(null); // Проверка на дубликат
      mockRequestRepo.create.mockReturnValue({ id: 'req1' });
      mockRequestRepo.save.mockResolvedValue({ id: 'req1', status: 'pending' });

      const result = await service.create(createDto);
      expect(result.id).toBe('req1');
      expect(
        mockNotificationsService.notifyUserRequestStatus,
      ).toHaveBeenCalled();
      expect(mockRequestRepo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const requestId = 'uuid-1';
    const userId = 'user-1';

    it('Если пользователь без прав администратора ForbiddenException', async () => {
      const mockRequest = {
        id: requestId,
        receiver: { id: 'user-2', role: UserRole.USER },
      };
      mockRequestRepo.findOne.mockResolvedValue(mockRequest);

      await expect(
        service.update(userId, requestId, { status: RequestStatus.ACCEPTED }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Если статус не pending, то isRead', async () => {
      const mockRequest = {
        id: requestId,
        receiver: { id: userId, role: UserRole.USER },
        status: RequestStatus.PENDING,
        isRead: false,
      };
      mockRequestRepo.findOne.mockResolvedValue(mockRequest);
      mockRequestRepo.save.mockImplementation((item) => item);

      const result = await service.update(userId, requestId, {
        status: RequestStatus.ACCEPTED,
      });

      expect(result.status).toBe(RequestStatus.ACCEPTED);
      expect(result.isRead).toBe(true);
    });
  });

  describe('delete', () => {
    it('Если пользователь без прав администратора ForbiddenException', async () => {
      const userPayload = {
        sub: 'user-1',
        role: UserRole.USER,
        email: 'abc@abc.abc',
      };
      const mockRequest = { id: 'request-1', sender: { id: 'user-2' } };

      mockRequestRepo.findOne.mockResolvedValue(mockRequest);

      await expect(service.delete(userPayload, 'request-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Администратор может удалить запрос', async () => {
      const adminPayload = {
        sub: 'admin-id',
        role: UserRole.ADMIN,
        email: 'admin@abc.abc',
      };
      const mockRequest = { id: 'request-1', sender: { id: 'user-2' } };

      mockRequestRepo.findOne.mockResolvedValue(mockRequest);
      mockRequestRepo.delete.mockResolvedValue({ affected: 1 });

      await service.delete(adminPayload, 'request-1');
      expect(mockRequestRepo.delete).toHaveBeenCalledWith({ id: 'request-1' });
    });
  });
});
