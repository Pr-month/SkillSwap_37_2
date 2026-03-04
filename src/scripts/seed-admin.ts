import { AppDataSource } from '../config/db.config';
import { User } from '../users/entities/user.entity';
import { UserRole, UserGender } from '../users/users.enums';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

export async function seedAdmin() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.ru';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL и ADMIN_PASSWORD должны быть заданы в .env');
    }

    const existingAdmin = await userRepo.findOne({
      where: { email: adminEmail },
    });
    if (existingAdmin) {
      console.log(
        `Администратор с email ${adminEmail} уже существует, пропускаем.`,
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminData: Partial<User> = {
      name: 'Администратор',
      email: adminEmail,
      password: hashedPassword,
      about: 'Администратор системы',
      birthdate: new Date('1990-01-01'),
      city: 'Москва',
      gender: UserGender.MALE,
      avatar: '',
      role: UserRole.ADMIN,
    };

    await userRepo.save(adminData);
    console.log(`Администратор создан с email: ${adminEmail}`);
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  seedAdmin().catch((e: unknown) => {
    console.error('Ошибка при сидинге Администратора:', e);
    process.exit(1);
  });
}
