import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { RequestStatus } from './requests.enums';
import { UpdateRequestDto } from './dto/update-request.dto';
import { UserRole } from '../users/users.enums';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @Inject()
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createRequestDto: CreateRequestDto) {
    const { offeredSkillId, requestedSkillId } = createRequestDto;

    const [offeredSkill, requestedSkill] = await Promise.all([
      this.skillRepository.findOne({
        where: { id: offeredSkillId },
        relations: ['owner'],
      }),
      this.skillRepository.findOne({
        where: { id: requestedSkillId },
        relations: ['owner'],
      }),
    ]);

    if (!offeredSkill) {
      throw new NotFoundException('Предлагаемый навык не найден');
    }

    if (!requestedSkill) {
      throw new NotFoundException('Запрашиваемый навык не найден');
    }

    const senderId = offeredSkill.owner.id;
    const receiverId = requestedSkill.owner.id;

    if (senderId === receiverId) {
      throw new BadRequestException('Невозможно отправить заявку самому себе');
    }

    const alreadyExist = await this.requestRepository.findOne({
      where: {
        sender: { id: senderId },
        receiver: { id: receiverId },
        offeredSkill: { id: offeredSkillId },
        requestedSkill: { id: requestedSkillId },
        status: In([
          RequestStatus.PENDING,
          RequestStatus.ACCEPTED,
          RequestStatus.IN_PROGRESS,
        ]),
      },
    });

    if (alreadyExist) {
      throw new BadRequestException(
        'Заявка уже существует или находится в работе',
      );
    }

    const request = this.requestRepository.create({
      sender: { id: senderId },
      receiver: { id: receiverId },
      offeredSkill: { id: offeredSkillId },
      requestedSkill: { id: requestedSkillId },
    });

    return await this.requestRepository.save(request);
  }

  async update(userId: string, id: string, updateRequestDto: UpdateRequestDto) {
    const request = await this.requestRepository.findOne({ where: { id: id } });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    /* Проверим, что статус изменяет получатель или админ */
    if (
      request.receiver.role !== UserRole.ADMIN &&
      request.receiver.id !== userId
    ) {
      throw new ForbiddenException(
        'Заявку может обновить администратор или получатель',
      );
    }

    request.status = updateRequestDto.status;

    if (request.status !== RequestStatus.PENDING) {
      request.isRead = true;
    }


    const response =  await this.requestRepository.save(request);
    
    this.notificationsService.notifyUserRequestStatus(userId, id, updateRequestDto.status)


    return await this.requestRepository.save(request);


  }

  async findIncoming(userId: string) {
    return this.requestRepository.find({
      where: {
        receiver: { id: userId },
        status: RequestStatus.PENDING,
      },
      relations: ['sender', 'receiver', 'requestedSkill', 'offeredSkill'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOutgoing(userId: string) {
    return this.requestRepository.find({
      where: {
        sender: { id: userId },
      },
      relations: ['sender', 'receiver', 'requestedSkill', 'offeredSkill'],
      order: { createdAt: 'DESC' },
    });
  }
}
