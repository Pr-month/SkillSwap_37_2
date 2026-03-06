import { AppDataSource } from '../config/db.config';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';

export async function seedSkills() {
  await AppDataSource.initialize();
  const skillRepo = AppDataSource.getRepository(Skill);
  const userRepo = AppDataSource.getRepository(User);
  const categoryRepo = AppDataSource.getRepository(Category);

  const existing = await skillRepo.count();
  if (existing > 0) {
    console.log('Таблица skills уже содержит данные, пропускаем сидинг.');
    await AppDataSource.destroy();
    return;
  }

  const users = await userRepo.find({
    where: [
      { email: 'user1@test.com' },
      { email: 'user2@test.com' },
      { email: 'user3@test.com' },
    ],
  });

  if (users.length === 0) {
    console.error('Пользователи не найдены. Сначала выполните seed-users.');
    await AppDataSource.destroy();
    process.exit(1);
  }

  let category = await categoryRepo.findOne({ where: { name: 'Разное' } });
  if (!category) {
    category = categoryRepo.create({ name: 'Разное', parent: null });
    await categoryRepo.save(category);
    console.log('Создана категория "Разное"');
  }

  if (users.length < 3) {
    console.warn(
      `Найдено только ${users.length} пользователя(ей). Навыки будут распределены циклически.`,
    );
  }

  const skillTemplates = [
    {
      title: 'JavaScript',
      description: 'Язык программирования для веб-разработки',
    },
    {
      title: 'Python',
      description: 'Универсальный язык программирования',
    },
    {
      title: 'Дизайн',
      description: 'Графический дизайн и UX/UI',
    },
    {
      title: 'Маркетинг',
      description: 'Цифровой маркетинг и продвижение',
    },
    {
      title: 'Фотография',
      description: 'Профессиональная фотография',
    },
    {
      title: 'Перевод',
      description: 'Перевод с иностранных языков',
    },
    {
      title: 'Консалтинг',
      description: 'Бизнес консалтинг',
    },
    {
      title: 'Обучение',
      description: 'Обучение и преподавание',
    },
    {
      title: 'Ремонт',
      description: 'Ремонт бытовой техники',
    },
  ];

  const testSkills = skillTemplates.map((template, index) => ({
    ...template,
    images: [],
    owner: users[index % users.length],
    category,
  }));

  await skillRepo.save(testSkills);
  console.log(`Создано ${testSkills.length} тестовых навыков.`);

  await AppDataSource.destroy();
}

seedSkills().catch((e) => {
  console.error('Ошибка при сидинге навыков:', e);
  process.exit(1);
});
