#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER tourplanner WITH PASSWORD '$BACKEND_DB_PASS';
	CREATE DATABASE tourplanner;
	GRANT ALL PRIVILEGES ON DATABASE tourplanner TO tourplanner;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "tourplanner" <<-EOSQL
	GRANT ALL ON SCHEMA public TO tourplanner;
EOSQL
