-- Создание таблицы навыков
CREATE TABLE IF NOT EXISTS "skills" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    "ownerId" INTEGER REFERENCES "users"(id) ON DELETE CASCADE
);