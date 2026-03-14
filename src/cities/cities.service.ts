import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    const existing = await this.cityRepository.findOneBy({
      name: createCityDto.name,
    });
    if (existing) {
      throw new ConflictException(
        `Город с названием "${createCityDto.name}" уже существует`,
      );
    }

    const city = this.cityRepository.create({
      name: createCityDto.name,
    });
    return await this.cityRepository.save(city);
  }

  findAll() {
    return this.cityRepository.find();
  }

  async findOne(id: string) {
    const city = await this.cityRepository.findOneBy({ id });
    if (!city) {
      throw new NotFoundException(`Город с ID ${id} не найден`);
    }
    return city;
  }

  async update(id: string, updateCityDto: UpdateCityDto) {
    const city = await this.cityRepository.findOneBy({ id });
    if (!city) {
      throw new NotFoundException(`Город с ID ${id} не найден`);
    }

    if (updateCityDto.name && updateCityDto.name !== city.name) {
      const nameExists = await this.cityRepository.findOneBy({
        name: updateCityDto.name,
      });
      if (nameExists) {
        throw new ConflictException(
          `Название "${updateCityDto.name}" уже занято`,
        );
      }
      city.name = updateCityDto.name;
    }

    return await this.cityRepository.save(city);
  }

  async remove(id: string) {
    const city = await this.cityRepository.findOneBy({ id });
    if (!city) {
      throw new NotFoundException(`Город с ID ${id} не найден`);
    }
    await this.cityRepository.remove(city);
  }
}
