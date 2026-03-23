-- Создание таблицы навыков
CREATE TABLE IF NOT EXISTS "skills" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    "ownerId" UUID REFERENCES "users"(id) ON DELETE CASCADE,
    "categoryId" UUID REFERENCES "categories"(id) ON DELETE SET NULL,
    images TEXT[]
);