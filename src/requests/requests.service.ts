import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {CreateRequestDto} from './dto/create-request.dto';
import {UpdateRequestDto} from './dto/update-request.dto';
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
        const {senderId, receiverId, offeredSkillId, requestedSkillId} = createRequestDto;

        if (senderId === receiverId) {
            throw new BadRequestException('Невозможно отправить заявку самому себе');
        }

        /*
        Отправитель и получатель существуют,
        а предлагаемый навык существует и принадлежит отправителю, желаемый - получателю,
        заявка не дублируется
         */
        const [senderExists, receiverExists, offeredSkill, requestedSkill, alreadyExist] = await Promise.all([
            this.userRepository.findOneBy({id: senderId}),
            this.userRepository.findOneBy({id: receiverId}),
            this.skillRepository.findOne({
                where: {id: offeredSkillId, owner: {id: senderId}}
            }),
            this.skillRepository.findOne({
                where: {id: requestedSkillId, owner: {id: receiverId}}
            }),
            this.requestsRepository.findOne({
                where: {
                    sender: {id: senderId},
                    receiver: {id: receiverId},
                    offeredSkill: {id: offeredSkillId},
                    requestedSkill: {id: requestedSkillId},
                    status: In([RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS])
                }
            }),
        ]);

        if (!senderExists) {
            throw new BadRequestException('Отправитель не найден');
        }

        if (!receiverExists) {
            throw new BadRequestException('Получатель не найден');
        }

        if (!offeredSkill) {
            throw new BadRequestException('Предлагаемый навык не найден или не принадлежит вам');
        }
        if (!requestedSkill) {
            throw new BadRequestException('Запрашиваемый навык не найден или не принадлежит получателю');
        }

        if (alreadyExist) {
            throw new BadRequestException('Заявка уже существует или находится в работе');
        }

        const request = this.requestsRepository.create(
            {
                sender: {id: createRequestDto.senderId},
                receiver: {id: createRequestDto.receiverId},
                offeredSkill: {id: createRequestDto.offeredSkillId},
                requestedSkill: {id: createRequestDto.requestedSkillId},
            }
        )

        return await this.requestsRepository.save(request);
    }
}
