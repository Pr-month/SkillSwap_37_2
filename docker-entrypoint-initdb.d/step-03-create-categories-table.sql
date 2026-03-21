-- Создание таблицы категорий
CREATE TABLE IF NOT EXISTS "categories" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    "parentId" UUID REFERENCES "categories"(id) ON DELETE SET NULL
);