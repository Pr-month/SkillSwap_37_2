import { seedAdmin } from './seed-admin';
import { seedUsers } from './seed-users';

async function seeder() {
  console.log('Запуск сидинга администратора...');
  await seedAdmin();
  console.log('Сидинг администратора завершён.');

  console.log('Запуск сидинга тестовых пользователей...');
  await seedUsers();
  console.log('Сидинг тестовых пользователей завершён.');

  console.log('Все сидинги успешно выполнены.');
}

if (require.main === module) {
  seeder().catch((e) => {
    console.error('Ошибка в мастер-сидинге:', e);
    process.exit(1);
  });
}
