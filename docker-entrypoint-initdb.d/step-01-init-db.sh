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
