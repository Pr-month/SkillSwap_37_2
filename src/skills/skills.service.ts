import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { GetSkillsQueryDto } from './dto/get-skills-query.dto';
import { Skill } from './entities/skill.entity';
import { JwtPayload } from 'src/auth/auth.types';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto) {
    const skill = this.skillsRepository.create(createSkillDto);
    return await this.skillsRepository.save(skill);
  }

  async findAll(query: GetSkillsQueryDto) {
    const { page = 1, limit = 20, search } = query;

    const qb = this.skillsRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.owner', 'owner');

    if (search) {
      qb.where('LOWER(skill.title) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const total = await qb.getCount();
    const totalPages = Math.ceil(total / limit) || 1;

    if (page > totalPages) {
      throw new NotFoundException(
        `Страница ${page} не найдена. Всего страниц: ${totalPages}`,
      );
    }

    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      page,
      totalPages,
    };
  }

  async findOne(id: number) {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!skill) {
      throw new NotFoundException(`Навык с id ${id} не найден`);
    }

    return skill;
  }

  async findOneAndCheckOwner(id: number, user: JwtPayload) {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!skill) {
      throw new NotFoundException(`Навык с id ${id} не найден`);
    }

    if (skill.owner.email != user.email) {
      throw new ForbiddenException("Can`t auth for request");
    }  

    return true;
  }


  async update(id: number, updateSkillDto: UpdateSkillDto, userId: number) {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!skill) {
      throw new NotFoundException(`Навык с id ${id} не найден`);
    }

    if (skill.owner.id !== userId) {
      throw new ForbiddenException('Можно обновить только свой навык');
    }

    Object.assign(skill, updateSkillDto);
    return this.skillsRepository.save(skill);
  }

  remove(id: number) {
    return `This action removes a #${id} skill`;
  }
}
