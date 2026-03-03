-- Создание пользователя-администратора
INSERT INTO "user" (name, email, password, role, about, birthdate, city, gender, avatar) VALUES
('Администратор', '${ADMIN_EMAIL}', '${ADMIN_PASSWORD}', 'admin', 'Администратор системы', '1990-01-01', 'Москва', 'male', ''),
