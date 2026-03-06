import {BadRequestException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {CreateRequestDto} from './dto/create-request.dto';
import {InjectRepository} from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import {Request} from "./entities/request.entity";
import {User} from "../users/entities/user.entity";
import {Skill} from "../skills/entities/skill.entity";
import {RequestStatus} from "./requests.enums";


@Injectable()
export class RequestsService {
    constructor(
        @InjectRepository(Request)
        private readonly requestsRepository: Repository<Request>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Skill)
        private readonly skillRepository: Repository<Skill>,
    ) {
    }

    async create(createRequestDto: CreateRequestDto) {
        const {offeredSkillId, requestedSkillId} = createRequestDto;

        const [offeredSkill, requestedSkill] = await Promise.all([
            this.skillRepository.findOne({where: {id: offeredSkillId}, relations: ['owner']}),
            this.skillRepository.findOne({where: {id: requestedSkillId}, relations: ['owner']})
        ])

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

        const alreadyExist = await this.requestsRepository.findOne({
            where: {
                sender: {id: senderId},
                receiver: {id: receiverId},
                offeredSkill: {id: offeredSkillId},
                requestedSkill: {id: requestedSkillId},
                status: In([RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS])
            }
        });

        if (alreadyExist) {
            throw new BadRequestException('Заявка уже существует или находится в работе');
        }

        const request = this.requestsRepository.create(
            {
                sender: {id: senderId},
                receiver: {id: receiverId},
                offeredSkill: {id: offeredSkillId},
                requestedSkill: {id: requestedSkillId},
            }
        );

        return await this.requestsRepository.save(request);
    }
}
