-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS "users" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    about TEXT,
    birthdate DATE,
    city VARCHAR(255),
    gender VARCHAR(50),
    avatar VARCHAR(255),
    "refreshToken" VARCHAR(255)
);