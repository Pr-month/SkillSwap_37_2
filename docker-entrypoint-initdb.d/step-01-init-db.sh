#!/bin/bash
set -e

echo "Starting database initialization..."
echo "Creating database: ${DB_NAME:-skillswap_test}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER ${DB_USER:-db_user} WITH PASSWORD '${DB_PASSWORD:-db_password}';
    CREATE DATABASE ${DB_NAME:-skillswap_test};
    GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME:-skillswap_test} TO ${DB_USER:-db_user};
EOSQL

echo "Database ${DB_NAME:-skillswap_test} created successfully"

# Создание таблиц и наполнение их тестовыми данными
echo "Creating tables and seeding data..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "${DB_NAME:-skillswap_test}" <<-EOSQL
    \i /docker-entrypoint-initdb.d/step-02-create-users-table.sql
    \i /docker-entrypoint-initdb.d/step-03-create-skills-table.sql
    \i /docker-entrypoint-initdb.d/step-04-create-categories-table.sql

EOSQL

echo "Tables created and data seeded successfully"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "${DB_NAME:-skillswap_test}" <<-EOSQL
    ALTER TABLE "users" OWNER TO "$DB_USER";
    ALTER TABLE "skills" OWNER TO "$DB_USER";
    ALTER TABLE "categories" OWNER TO "$DB_USER";
    GRANT ALL ON SCHEMA public TO "$DB_USER";
    GRANT ALL ON ALL TABLES IN SCHEMA public TO "$DB_USER";
EOSQL

