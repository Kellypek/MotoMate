import sqlite3
from pathlib import Path


DATABASE_PATH = Path("data/motomate.db")


def get_connection():
    DATABASE_PATH.parent.mkdir(exist_ok=True)

    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


def initialize_database():
    connection = get_connection()

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
    connection.close()


if __name__ == "__main__":
    initialize_database()
    print("Database initialized successfully.")