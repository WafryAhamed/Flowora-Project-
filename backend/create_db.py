"""
Script to create the flowora_db database in PostgreSQL if it doesn't exist.
Uses the credentials from local.env: postgresql://postgres:2001@localhost:5432/flowora_db
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DB_NAME = "flowora_db"
DB_USER = "postgres"
DB_PASSWORD = "2001"
DB_HOST = "localhost"
DB_PORT = "5432"

def create_database():
    try:
        # Connect to the default 'postgres' database
        conn = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Check if the database already exists
        cursor.execute(
            "SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (DB_NAME,)
        )
        exists = cursor.fetchone()

        if not exists:
            cursor.execute(f'CREATE DATABASE "{DB_NAME}"')
            print(f"[OK] Database '{DB_NAME}' created successfully!")
        else:
            print(f"[OK] Database '{DB_NAME}' already exists.")

        cursor.close()
        conn.close()
    except psycopg2.OperationalError as e:
        print(f"[ERROR] Could not connect to PostgreSQL: {e}")
        print("  Make sure PostgreSQL is running and credentials are correct.")
        raise

if __name__ == "__main__":
    create_database()
