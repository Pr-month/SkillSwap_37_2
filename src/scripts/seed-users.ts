import { AppDataSource } from '../config/db.config';
import { User } from '../users/entities/user.entity';
import { UserRole, UserGender } from '../users/users.enums';

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  try {
    const existing = await userRepo.count();
    if (existing > 0) {
      console.log('Таблица users уже содержит данные, пропускаем сидинг.');
      return;
    }

    // В реальном приложении используйте bcrypt, для сидинга используем простой хеш
    const hashedPassword =
      '$2b$10$rEImafkVza/CpCVaVt5O8e5b/D8BKe9W4I1Sm0qQyMTqMh9wM5EjG'; // хеш для password123

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

    await userRepo.save(testUsers);
    console.log(`Создано ${testUsers.length} тестовых пользователей.`);
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((e) => {
  console.error('Ошибка при сидинге пользователей:', e);
  process.exit(1);
});
