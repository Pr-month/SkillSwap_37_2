-- Создание типа enum для статуса запроса
CREATE TYPE request_status_enum AS ENUM ('pending', 'accepted', 'rejected', 'inProgress', 'done');

-- Создание таблицы запросов
CREATE TABLE IF NOT EXISTS "requests" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    status request_status_enum DEFAULT 'pending',
    "offeredSkillId" UUID NOT NULL,
    "requestedSkillId" UUID NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    CONSTRAINT fk_sender FOREIGN KEY ("senderId") REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_receiver FOREIGN KEY ("receiverId") REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_offered_skill FOREIGN KEY ("offeredSkillId") REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT fk_requested_skill FOREIGN KEY ("requestedSkillId") REFERENCES skills(id) ON DELETE CASCADE
);