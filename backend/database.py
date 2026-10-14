
import sqlite3
from pathlib import Path

from flask import current_app, has_app_context


BACKEND_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BACKEND_DIR / "data" / "motomate.db"


def get_database_path():
    if has_app_context():
        return Path(current_app.config["DATABASE_PATH"])

    return DATABASE_PATH


def get_connection():
    database_path = get_database_path()
    database_path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(str(database_path))
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


def initialize_database():
    database_path = get_database_path()
    database_path.parent.mkdir(parents=True, exist_ok=True)

    connection = get_connection()

    try:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS motorcycles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand TEXT NOT NULL,
                model TEXT NOT NULL,
                registration_number TEXT NOT NULL UNIQUE,
                year INTEGER NOT NULL,
                current_mileage INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection.execute("""
            CREATE TABLE IF NOT EXISTS maintenance_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                motorcycle_id INTEGER NOT NULL,
                service_type TEXT NOT NULL,
                service_date DATE NOT NULL,
                service_mileage INTEGER NOT NULL,
                interval_km INTEGER NOT NULL,
                cost REAL,
                notes TEXT,
                FOREIGN KEY (motorcycle_id)
                    REFERENCES motorcycles(id)
                    ON DELETE CASCADE
            )
        """)

        connection.commit()
    finally:
        connection.close()


if __name__ == "__main__":
    initialize_database()
    print(f"Database initialized: {DATABASE_PATH}")
