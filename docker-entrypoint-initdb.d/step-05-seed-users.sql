-- Создание тестовых пользователей
INSERT INTO "users" (name, email, password, role, about, birthdate, city, gender, avatar) VALUES
('Пользователь 1', 'user1@test.com', 'user12345', 'user', 'Тестовый пользователь 1', '1995-05-15', 'Санкт-Петербург', 'female', ''),
('Пользователь 2', 'user2@test.com', 'user23456', 'user', 'Тестовый пользователь 2', '1992-08-22', 'Новосибирск', 'male', ''),
('Пользователь 3', 'user3@test.com', 'user34567', 'user', 'Тестовый пользователь 3', '1988-12-03', 'Екатеринбург', 'female', '');