#!/bin/bash
set -e

echo "Starting database initialization..."
echo "Creating database: $DB_NAME"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER ${DB_USER:-db_user} WITH PASSWORD '${DB_PASSWORD:-db_password}';
    CREATE DATABASE $DB_NAME;
    GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO ${DB_USER:-db_user};
EOSQL

echo "Database $DB_NAME created successfully"

# Создание таблиц и наполнение их тестовыми данными
echo "Creating tables and seeding data..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-EOSQL
    \i /docker-entrypoint-initdb.d/step-02-create-users-table.sql
    \i /docker-entrypoint-initdb.d/step-03-create-skills-table.sql
    \i /docker-entrypoint-initdb.d/step-04-seed-admin.sql    
    \i /docker-entrypoint-initdb.d/step-05-seed-users.sql
    \i /docker-entrypoint-initdb.d/step-06-seed-skills.sql
EOSQL

echo "Tables created and data seeded successfully"
