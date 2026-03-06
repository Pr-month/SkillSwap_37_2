import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { User } from './entities/user.entity';
import { appConfig, IConfig } from '../config/app.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      return null;
    }

    return this.toPublicUser(user);
  }

  async updateProfile(id: number, updateUserProfileDto: UpdateUserProfileDto) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      return null;
    }

    Object.assign(user, updateUserProfileDto);
    const saved = await this.usersRepository.save(user);

    return this.toPublicUser(saved);
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
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

    user.password = await bcrypt.hash(changePasswordDto.newPassword, this.config.hashSalt);
    await this.usersRepository.save(user);

    return this.toPublicUser(user);
  }

  async remove(id: number) {
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

  async clearRefreshToken(userId: number): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: '' as string });
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
  await this.usersRepository.update(userId, {
    refreshToken,
  });
}
}
