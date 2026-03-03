-- Создание тестовых навыков для пользователей
-- Получаем ID пользователей
WITH user_ids AS (
  SELECT id, name FROM "user" WHERE email IN ('user1@test.com', 'user2@test.com', 'user3@test.com')
)
INSERT INTO skills (title, description, "ownerId") 
SELECT 
  skill_title,
  skill_description,
  uid.id
FROM user_ids uid
CROSS JOIN (
  VALUES 
    ('JavaScript', 'Язык программирования для веб-разработки', 1),
    ('Python', 'Универсальный язык программирования', 2),
    ('Дизайн', 'Графический дизайн и UX/UI', 3),
    ('Маркетинг', 'Цифровой маркетинг и продвижение', 1),
    ('Фотография', 'Профессиональная фотография', 2),
    ('Перевод', 'Перевод с иностранных языков', 3),
    ('Консалтинг', 'Бизнес консалтинг', 1),
    ('Обучение', 'Обучение и преподавание', 2),
    ('Ремонт', 'Ремонт бытовой техники', 3)
) AS skills(skill_title, skill_description, user_index)
WHERE CASE 
  WHEN uid.name = 'Пользователь 1' THEN user_index = 1
  WHEN uid.name = 'Пользователь 2' THEN user_index = 2
  WHEN uid.name = 'Пользователь 3' THEN user_index = 3
  ELSE false
END;