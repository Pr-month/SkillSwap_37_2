import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { appConfig, IConfig } from '../config/app.config';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { User } from './entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @Inject(appConfig.KEY)
    private readonly config: IConfig,
  ) {}

  private toPublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    const saved = await this.usersRepository.save(user);
    return this.toPublicUser(saved);
  }

  async findAll(getUsersQueryDto: GetUsersQueryDto) {
    const { page = 1, limit = 20 } = getUsersQueryDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.usersRepository.findAndCount({
      skip,
      take: limit,
      select: ['id', 'name', 'email', 'role'],
    });

    const totalPages = Math.ceil(total / limit) || 1;

    if (page > totalPages) {
      throw new NotFoundException(
        `Страница ${page} не найдена. Всего страниц: ${totalPages}`,
      );
    }

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      return null;
    }

    return this.toPublicUser(user);
  }

  async updateProfile(id: string, updateUserProfileDto: UpdateUserProfileDto) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      return null;
    }

    Object.assign(user, updateUserProfileDto);
    const saved = await this.usersRepository.save(user);

    return this.toPublicUser(saved);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Неверный старый пароль');
    }

    user.password = await bcrypt.hash(
      changePasswordDto.newPassword,
      this.config.hashSalt,
    );
    await this.usersRepository.save(user);

    return this.toPublicUser(user);
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      return null;
    }

    await this.usersRepository.remove(user);

    return this.toPublicUser(user);
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async createFromAuth(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);

    return this.usersRepository.save(user);
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: '' });
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.usersRepository.update(userId, {
      refreshToken,
    });
  }

  async verifyRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user || !user.refreshToken) {
      return false;
    }
    return bcrypt.compare(refreshToken, user.refreshToken);
  }

  async removeFavorite(id: string, userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (!user.favoriteSkills)
      throw new NotFoundException('Список избранного пуст');

    const skillIndex = user.favoriteSkills.findIndex(
      (skill) => skill.id === id,
    );
    if (skillIndex === -1) {
      throw new NotFoundException(`Навык с id ${id} не найден в избранном`);
    }

    user.favoriteSkills.splice(skillIndex, 1);
    return this.usersRepository.save(user);
  }

  async addFavorite(id: string, userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Проверяем, есть ли уже навык в избранном
    if (user.favoriteSkills?.some((skill) => skill.id === id)) {
      throw new NotFoundException(`Навык с id ${id} присутствует в избранном`);
    }

    // Находим навык
    const skill = await this.skillRepository.findOneBy({ id });
    if (!skill) throw new NotFoundException(`Навык с id ${id} не найден`);

    // Инициализируем массив, если его нет
    if (!user.favoriteSkills) {
      user.favoriteSkills = [];
    }

    // Добавляем навык
    user.favoriteSkills.push(skill);
    return this.usersRepository.save(user);
  }
}
