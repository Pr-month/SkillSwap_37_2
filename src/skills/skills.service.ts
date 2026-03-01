import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  create(createSkillDto: CreateSkillDto) {
    void createSkillDto;
    return 'This action adds a new skill';
  }

  findAll() {
    return `This action returns all skills`;
  }

  findOne(id: number) {
    return `This action returns a #${id} skill`;
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
