import os
import shutil
import socket
import subprocess
import sys
import time
import venv
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

VENV_DIR = PROJECT_ROOT / ".venv"
REQUIREMENTS_FILE = BACKEND_DIR / "requirements.txt"
DATA_DIR = BACKEND_DIR / "data"
DATABASE_FILE = DATA_DIR / "motomate.db"
FRONTEND_DIR = PROJECT_ROOT / "frontend"

BACKEND_HOST = "127.0.0.1"
BACKEND_PORT = 5000
FRONTEND_HOST = "127.0.0.1"
FRONTEND_PORT = 5173

LOG_DIR = PROJECT_ROOT / "logs"
BACKEND_LOG = LOG_DIR / "backend.log"
FRONTEND_LOG = LOG_DIR / "frontend.log"


def run_command(command, cwd=None):
    """Run a command and report failures clearly."""
    print(f"\n> {' '.join(map(str, command))}")
    subprocess.run(
        [str(item) for item in command],
        cwd=str(cwd) if cwd else None,
        check=True,
    )


def check_python_version():
    if sys.version_info < (3, 12):
        raise RuntimeError(
            "Python 3.12 or higher is required. "
            f"Detected {sys.version.split()[0]}."
        )

    print(f"Python {sys.version.split()[0]} detected.")


def check_node_and_npm():
    node = shutil.which("node")
    npm = shutil.which("npm")

    if not node or not npm:
        raise RuntimeError(
            "Node.js and npm are required for the frontend. "
            "Install a compatible Node.js LTS release, then reopen the terminal."
        )

    run_command([node, "--version"])
    run_command([npm, "--version"])

    if not (FRONTEND_DIR / "package.json").is_file():
        raise RuntimeError("frontend/package.json was not found.")

    if not (FRONTEND_DIR / "package-lock.json").is_file():
        raise RuntimeError(
            "frontend/package-lock.json was not found; "
            "cannot perform a reproducible npm ci installation."
        )

    print("Node.js, npm, and frontend files are ready.")


def create_virtual_environment():
    python_executable = (
        VENV_DIR / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    )

    if python_executable.is_file():
        print("Existing Python virtual environment will be reused.")
        return python_executable

    print("Creating Python virtual environment...")
    venv.create(VENV_DIR, with_pip=True)

    if not python_executable.is_file():
        raise RuntimeError("Virtual environment creation failed.")

    print("Python virtual environment created.")
    return python_executable


def install_backend_dependencies(python_executable):
    if not REQUIREMENTS_FILE.is_file():
        raise RuntimeError("requirements.txt was not found.")

    run_command([
        python_executable, "-m", "pip", "install",
        "-r", REQUIREMENTS_FILE,
    ])

    print("Backend dependencies are ready.")


def install_frontend_dependencies():
    npm = shutil.which("npm")

    node_modules = FRONTEND_DIR / "node_modules"
    vite_executable = node_modules / (".bin/vite.cmd" if os.name == "nt" else ".bin/vite")

    if node_modules.is_dir() and vite_executable.exists():
        print("Existing frontend dependencies detected; reusing them.")
        return

    print("Installing frontend dependencies using package-lock.json...")
    run_command([npm, "ci"], cwd=FRONTEND_DIR)
    print("Frontend dependencies are ready.")


def prepare_data_directory():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if DATABASE_FILE.exists():
        print(f"Existing database preserved: {DATABASE_FILE}")
    else:
        print("No database file exists yet; the application may initialize it.")

    LOG_DIR.mkdir(parents=True, exist_ok=True)


def is_port_open(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as connection:
        connection.settimeout(1)
        return connection.connect_ex((host, port)) == 0


def is_backend_healthy():
    try:
        with urlopen("http://127.0.0.1:5000/health", timeout=2) as response:
            return response.status == 200
    except (URLError, TimeoutError, OSError):
        return False


def is_frontend_healthy():
    try:
        with urlopen("http://127.0.0.1:5173/", timeout=2) as response:
            return response.status == 200
    except (URLError, TimeoutError, OSError):
        return False


def start_process(command, cwd, log_file):
    """Start a process without tying its lifetime to this setup script."""
    log_handle = open(log_file, "a", encoding="utf-8")

    options = {
        "cwd": str(cwd),
        "stdout": log_handle,
        "stderr": subprocess.STDOUT,
        "stdin": subprocess.DEVNULL,
    }

    if os.name == "nt":
        options["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        options["start_new_session"] = True

    try:
        process = subprocess.Popen(
            [str(item) for item in command],
            **options,
        )
    finally:
        # The child process inherits the redirected file descriptor.
        log_handle.close()

    return process


def ensure_backend_running(python_executable):
    if is_backend_healthy():
        print("Flask backend is already healthy; reusing it.")
        return

    if is_port_open(BACKEND_HOST, BACKEND_PORT):
        raise RuntimeError(
            "Port 5000 is occupied, but the service did not pass "
            "the MotoMate /health check. No process was terminated."
        )

    print("Starting Flask backend...")
    start_process(
        [python_executable, BACKEND_DIR / "app.py"],
        BACKEND_DIR,
        BACKEND_LOG,
    )

    for _ in range(20):
        time.sleep(1)

        if is_backend_healthy():
            print("Flask backend is ready at http://127.0.0.1:5000")
            return

    raise RuntimeError(
        "Flask backend did not become healthy within 20 seconds. "
        f"Check the log: {BACKEND_LOG}"
    )


def ensure_frontend_running():
    if is_frontend_healthy():
        print("Vite frontend is already healthy; reusing it.")
        return

    if is_port_open(FRONTEND_HOST, FRONTEND_PORT):
        raise RuntimeError(
            "Port 5173 is occupied, but the frontend did not respond "
            "successfully. No process was terminated."
        )

    npm = shutil.which("npm")
    print("Starting Vite frontend...")
    start_process(
        [npm, "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173", "--strictPort"],
        FRONTEND_DIR,
        FRONTEND_LOG,
    )

    for _ in range(30):
        time.sleep(1)

        if is_frontend_healthy():
            print("Vite frontend is ready at http://127.0.0.1:5173")
            return

    raise RuntimeError(
        "Vite frontend did not become ready within 30 seconds. "
        f"Check the log: {FRONTEND_LOG}"
    )


def main():
    print("=" * 48)
    print("MotoMate Infrastructure as Code Setup")
    print("=" * 48)

    check_python_version()
    check_node_and_npm()

    python_executable = create_virtual_environment()
    install_backend_dependencies(python_executable)
    install_frontend_dependencies()
    prepare_data_directory()

    ensure_backend_running(python_executable)
    ensure_frontend_running()

    print("\n" + "=" * 48)
    print("MotoMate setup completed successfully.")
    print("Frontend: http://127.0.0.1:5173")
    print("Backend:  http://127.0.0.1:5000")
    print(f"Backend log:  {BACKEND_LOG}")
    print(f"Frontend log: {FRONTEND_LOG}")
    print("=" * 48)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        print(
            f"\nERROR: A command failed with exit code {error.returncode}.",
            file=sys.stderr,
        )
        sys.exit(error.returncode or 1)
    except (RuntimeError, OSError) as error:
        print(f"\nERROR: {error}", file=sys.stderr)
        sys.exit(1)
