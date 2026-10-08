import os
import subprocess
import sys
import venv
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent
VENV_DIR = PROJECT_ROOT / ".venv"
REQUIREMENTS_FILE = PROJECT_ROOT / "requirements.txt"
DATA_DIR = PROJECT_ROOT / "data"


def create_virtual_environment():
    if VENV_DIR.exists():
        print("Virtual environment already exists.")
        return

    print("Creating virtual environment...")
    venv.create(VENV_DIR, with_pip=True)
    print("Virtual environment created.")


def get_python_executable():
    if os.name == "nt":
        return VENV_DIR / "Scripts" / "python.exe"

    return VENV_DIR / "bin" / "python"


def install_dependencies():
    python_executable = get_python_executable()

    print("Installing dependencies...")

    subprocess.check_call([
        str(python_executable),
        "-m",
        "pip",
        "install",
        "-r",
        str(REQUIREMENTS_FILE)
    ])

    print("Dependencies installed.")


def create_data_directory():
    DATA_DIR.mkdir(exist_ok=True)
    print("Data directory is ready.")


def initialize_database():
    python_executable = get_python_executable()

    print("Initializing database...")

    subprocess.check_call([
        str(python_executable),
        str(PROJECT_ROOT / "database.py")
    ])

    print("Database initialized.")


def start_application():
    python_executable = get_python_executable()

    print("Starting MotoMate...")

    subprocess.Popen([
        str(python_executable),
        str(PROJECT_ROOT / "app.py")
    ])


def main():
    print("===================================")
    print("       MotoMate IaC Setup")
    print("===================================")

    create_virtual_environment()
    install_dependencies()
    create_data_directory()
    initialize_database()
    start_application()

    print("===================================")
    print("MotoMate setup completed.")
    print("===================================")


if __name__ == "__main__":
    main()