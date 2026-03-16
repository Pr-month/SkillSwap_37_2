-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS "users" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    about TEXT NOT NULL,
    birthdate DATE NOT NULL,
    city VARCHAR(255) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    avatar VARCHAR(255) NOT NULL,
    "refreshToken" VARCHAR(255)
);