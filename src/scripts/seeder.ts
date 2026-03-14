import { AppDataSource } from '../config/db.config';
import { seedAdmin } from './seed-admin';
import { seedCategories } from './seed-categories';

async function seeder() {
  await AppDataSource.initialize();

  try {
    console.log('Запуск сидинга категорий...');
    await seedCategories(AppDataSource);
    console.log('Сидинг категорий завершён.');

    console.log('Запуск сидинга администратора...');
    await seedAdmin(AppDataSource);
    console.log('Сидинг администратора завершён.');

    console.log('Все сидинги успешно выполнены.');
  } catch (error) {
    console.error('Ошибка в мастер-сидинге:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  seeder().catch((e) => {
    console.error('Ошибка в мастер-сидинге:', e);
    process.exit(1);
  });
}
