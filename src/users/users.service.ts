import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type UserRecord = {
  id: number;
  name: string;
  email: string;
  password: string;
};

type PublicUser = {
  id: number;
  name: string;
  email: string;
};

@Injectable()
export class UsersService {
  private users: UserRecord[] = [];

  private nextUserId = 1;

  private toPublicUser(user: UserRecord): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  create(createUserDto: CreateUserDto) {
    const user = this.createFromAuth(createUserDto);

    return this.toPublicUser(user);
  }

  findAll() {
    return this.users.map((user) => this.toPublicUser(user));
  }

  findOne(id: number) {
    const user = this.users.find((item) => item.id === id);

    if (!user) {
      return null;
    }

    return this.toPublicUser(user);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const userIndex = this.users.findIndex((item) => item.id === id);

    if (userIndex === -1) {
      return null;
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateUserDto,
    };

    return this.toPublicUser(this.users[userIndex]);
  }

  remove(id: number) {
    const userIndex = this.users.findIndex((item) => item.id === id);

    if (userIndex === -1) {
      return null;
    }

    const [removedUser] = this.users.splice(userIndex, 1);
    return this.toPublicUser(removedUser);
  }

  findByEmail(email: string) {
    return this.users.find((user) => user.email === email);
  }

  createFromAuth(createUserDto: CreateUserDto): UserRecord {
    const user: UserRecord = {
      id: this.nextUserId,
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
    };

    this.users.push(user);
    this.nextUserId += 1;

    return user;
  }
}
