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

# Даём права на схему public в новой базе данных
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "${DB_NAME:-skillswap_test}" <<-EOSQL
    GRANT USAGE ON SCHEMA public TO ${DB_USER:-db_user};
    GRANT CREATE ON SCHEMA public TO ${DB_USER:-db_user};
    GRANT ALL ON SCHEMA public TO ${DB_USER:-db_user};
EOSQL

# Создание таблиц и наполнение их тестовыми данными
echo "Creating tables and seeding data..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "${DB_NAME:-skillswap_test}" <<-EOSQL
    \i /docker-entrypoint-initdb.d/step-02-create-users-table.sql
    \i /docker-entrypoint-initdb.d/step-03-create-categories-table.sql
    \i /docker-entrypoint-initdb.d/step-04-create-skills-table.sql
    \i /docker-entrypoint-initdb.d/step-05-create-requests-table.sql

EOSQL

echo "Tables created and data seeded successfully"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "${DB_NAME:-skillswap_test}" <<-EOSQL
    ALTER TABLE "users" OWNER TO ${DB_USER:-db_user};
    ALTER TABLE "skills" OWNER TO ${DB_USER:-db_user};
    ALTER TABLE "categories" OWNER TO ${DB_USER:-db_user};
    ALTER TABLE "requests" OWNER TO ${DB_USER:-db_user};
    GRANT ALL ON ALL TABLES IN SCHEMA public TO ${DB_USER:-db_user};
EOSQL
