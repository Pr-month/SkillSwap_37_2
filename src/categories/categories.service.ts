import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
    });

    /* Если указан родитель, проверяем существует ли он */
    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findOneBy({
        id: createCategoryDto.parentId,
      });

      if (!parent) {
        throw new NotFoundException(
          `Родитель ${createCategoryDto.parentId} не найден`,
        );
      }

      category.parent = parent;
    }

    return await this.categoryRepository.save(category);
  }

  findAll() {
    return this.categoryRepository.find({ where: { parent: IsNull() } });
  }

  findOne(id: string) {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException(`Категория с ID ${id} не найдена`);
    }

    /* Обновляем название, если оно изменилось и ещё не существует в базе */
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const nameExists = await this.categoryRepository.findOneBy({
        name: updateCategoryDto.name,
      });
      if (nameExists) {
        throw new ConflictException(
          `Название "${updateCategoryDto.name}" уже занято`,
        );
      }
      category.name = updateCategoryDto.name;
    }

    /* Обновляем родителя */
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException(
          'Категория не может быть родителем самой себе',
        );
      }

      if (updateCategoryDto.parentId === null) {
        category.parent = null;
      } else {
        const parent = await this.categoryRepository.findOneBy({
          id: updateCategoryDto.parentId,
        });
        if (!parent) {
          throw new NotFoundException('Родитель не найден');
        }
        category.parent = parent;
      }
    }

    return await this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException(`Категория с ID ${id} не найдена`);
    }

    await this.categoryRepository.remove(category);
  }
}
