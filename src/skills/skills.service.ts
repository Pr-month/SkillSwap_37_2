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
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto, ownerId: string) {
    const skill = this.skillsRepository.create({
      ...createSkillDto,
      category: { id: createSkillDto.category },
      owner: { id: ownerId },
    });

    const savedSkill = await this.skillsRepository.save(skill);

    return await this.skillsRepository.findOne({
      where: { id: savedSkill.id },
      relations: ['owner'],
    });
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

  async findOne(id: string) {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!skill) {
      throw new NotFoundException(`Навык с id ${id} не найден`);
    }

    return skill;
  }

  async findOneAndCheckOwner(id: string, user: JwtPayload) {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!skill) {
      throw new NotFoundException(`Навык с id ${id} не найден`);
    }

    if (skill.owner.email != user.email) {
      throw new ForbiddenException('Can`t auth for request');
    }

    return true;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto, userId: string) {
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

  async remove(id: string) {
    const skill = await this.skillsRepository.findOneBy({ id });
    if (!skill) {
      throw new NotFoundException(`Навык с id ${id} не найден`);
    }

    if (skill.images?.length) {
    await Promise.allSettled(
      skill.images.map((imagePath) =>
        unlink(join(process.cwd(), imagePath)),
      ),
    );
  }

    return this.skillsRepository.delete(id);
  }
}
