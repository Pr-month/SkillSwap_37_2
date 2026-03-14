import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/db.config';
import { User } from '../users/entities/user.entity';
import { UserRole, UserGender } from '../users/users.enums';
import * as bcrypt from 'bcrypt';

export async function seedUsers(dataSource?: DataSource) {
  let externalDataSource = false;
  let ds: DataSource;

  if (dataSource) {
    ds = dataSource;
    externalDataSource = true;
  } else {
    ds = AppDataSource;
    if (!ds.isInitialized) {
      await ds.initialize();
    }
  }

  try {
    const userRepo = ds.getRepository(User);
    const hashedPassword = await bcrypt.hash('password123', 10); // хеш для password123

    const testUsers = [
      {
        name: 'Пользователь 1',
        email: 'user1@test.com',
        password: hashedPassword,
        about: 'Тестовый пользователь 1',
        birthdate: new Date('1995-05-15'),
        city: 'Санкт-Петербург',
        gender: UserGender.FEMALE,
        avatar: 'useravatar1.png',
        role: UserRole.USER,
      },
      {
        name: 'Пользователь 2',
        email: 'user2@test.com',
        password: hashedPassword,
        about: 'Тестовый пользователь 2',
        birthdate: new Date('1992-08-22'),
        city: 'Новосибирск',
        gender: UserGender.MALE,
        avatar: 'useravatar2.png',
        role: UserRole.USER,
      },
      {
        name: 'Пользователь 3',
        email: 'user3@test.com',
        password: hashedPassword,
        about: 'Тестовый пользователь 3',
        birthdate: new Date('1988-12-03'),
        city: 'Екатеринбург',
        gender: UserGender.FEMALE,
        avatar: 'useravatar3.png',
        role: UserRole.USER,
      },
    ];

    for (const userData of testUsers) {
      const existing = await userRepo.findOne({
        where: { email: userData.email },
      });
      if (!existing) {
        await userRepo.save(userData);
        console.log(`Пользователь ${userData.email} создан.`);
      } else {
        console.log(
          `Пользователь ${userData.email} уже существует, пропускаем.`,
        );
      }
    }

    console.log('Сидинг тестовых пользователей завершён.');
  } finally {
    if (!externalDataSource && ds.isInitialized) {
      await ds.destroy();
    }
  }
}

if (require.main === module) {
  seedUsers().catch((e) => {
    console.error('Ошибка при сидинге пользователей:', e);
    process.exit(1);
  });
}
