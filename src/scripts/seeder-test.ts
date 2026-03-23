import { DataSource } from 'typeorm';
import { dbConfig } from '../config/db.config';
import { seedAdmin } from './seed-admin';
import { seedUsers } from './seed-users';
import { seedSkills } from './seed-skills';
import { seedCategories } from './seed-categories';

async function cleanDatabase(dataSource: DataSource) {
  console.log('Очистка базы данных...');
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Удаляем данные из таблиц в порядке, обратном зависимостям
    await queryRunner.query(`TRUNCATE TABLE "requests" CASCADE;`);
    await queryRunner.query(`TRUNCATE TABLE "skills" CASCADE;`);
    await queryRunner.query(`TRUNCATE TABLE "users" CASCADE;`);
    await queryRunner.query(`TRUNCATE TABLE "categories" CASCADE;`);

    await queryRunner.commitTransaction();
    console.log('База данных очищена.');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Ошибка при очистке базы данных:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async function seederTest() {
  // Создаём DataSource с synchronize: false
  const dataSource = new DataSource({
    ...dbConfig(),
    synchronize: false,
  });

  try {
    await dataSource.initialize();

    await cleanDatabase(dataSource);

    console.log('Запуск сидинга категорий...');
    await seedCategories(dataSource);
    console.log('Сидинг категорий завершён.');

    console.log('Запуск сидинга администратора...');
    await seedAdmin(dataSource);
    console.log('Сидинг администратора завершён.');

    console.log('Запуск сидинга тестовых пользователей...');
    await seedUsers(dataSource);
    console.log('Сидинг тестовых пользователей завершён.');

    console.log('Запуск сидинга навыков...');
    await seedSkills(dataSource);
    console.log('Сидинг навыков завершён.');

    console.log('Все тестовые сидинги успешно выполнены.');
  } catch (error) {
    console.error('Ошибка в тестовом сидинге:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  seederTest().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
