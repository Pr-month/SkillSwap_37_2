import { seedAdmin } from './seed-admin';
import { seedCategories } from './seed-categories';

async function seeder() {
  console.log('Запуск сидинга категорий...');
  await seedCategories();
  console.log('Сидинг категорий завершён.');

  console.log('Запуск сидинга администратора...');
  await seedAdmin();
  console.log('Сидинг администратора завершён.');

  console.log('Все сидинги успешно выполнены.');
}

if (require.main === module) {
  seeder().catch((e) => {
    console.error('Ошибка в мастер-сидинге:', e);
    process.exit(1);
  });
}
