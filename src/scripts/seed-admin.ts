import { AppDataSource } from '../config/db.config';
import { User } from '../users/entities/user.entity';
import { UserRole, UserGender } from '../users/users.enums';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  try {
    const existing = await userRepo.count();
    if (existing > 0) {
      console.log('Таблица users уже содержит данные, пропускаем сидинг.');
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.ru';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';

    const adminData = [
      {
        name: 'Администратор',
        email: adminEmail,
        password: adminPassword,
        about: 'Администратор системы',
        birthdate: new Date('1990-01-01'),
        city: 'Москва',
        gender: UserGender.MALE,
        avatar: '',
        role: UserRole.ADMIN,
      },
    ];

    await userRepo.save(adminData);
    console.log(`Администратор создан с email: ${adminEmail}`);
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((e) => {
  console.error('Ошибка при сидинге Администратора:', e);
  process.exit(1);
});
