
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


# ============================================================
# Configuration
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent
BACKEND_DIR = PROJECT_ROOT / "backend"

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


# ============================================================
# Command execution
# ============================================================

def run_command(command, cwd=None):
    """Run a command and report failures clearly."""
    print(f"\n> {' '.join(map(str, command))}")

    subprocess.run(
        [str(item) for item in command],
        cwd=str(cwd) if cwd else None,
        check=True,
    )


# ============================================================
# Runtime checks and installation
# ============================================================

def check_python_version():
    """Require Python 3.12 or later."""
    if sys.version_info < (3, 12):
        raise RuntimeError(
            "Python 3.12 or higher is required. "
            f"Detected {sys.version.split()[0]}. "
            "Install a supported Python version and rerun setup.py."
        )

    print(f"Python {sys.version.split()[0]} detected.")


def install_nodejs_with_winget():
    """
    Attempt to install Node.js LTS on Windows using winget.

    If winget is unavailable or installation fails, provide
    instructions for manual installation.
    """
    if os.name != "nt":
        raise RuntimeError(
            "Node.js and npm are missing. Automatic installation "
            "is configured for Windows only. Install Node.js LTS "
            "for your operating system and rerun setup.py."
        )

    winget = shutil.which("winget")

    if not winget:
        raise RuntimeError(
            "Node.js and npm are missing, and winget is unavailable.\n"
            "Install Node.js LTS from https://nodejs.org/ "
            "and reopen the terminal before rerunning setup.py."
        )

    print("\nNode.js/npm not found.")
    print("Attempting to install Node.js LTS using winget...")

    try:
        run_command([
            winget,
            "install",
            "--id", "OpenJS.NodeJS.LTS",
            "--exact",
            "--accept-source-agreements",
            "--accept-package-agreements",
        ])
    except (subprocess.CalledProcessError, OSError) as error:
        raise RuntimeError(
            "Automatic Node.js installation failed.\n"
            "Check your network connection and Windows permissions, "
            "or install Node.js LTS from https://nodejs.org/ "
            "then rerun setup.py."
        ) from error

    # Refresh PATH for the current Python process when Node.js
    # was installed in the standard Windows installation directory.
    program_files = os.environ.get(
        "ProgramFiles",
        r"C:\Program Files",
    )
    nodejs_dir = Path(program_files) / "nodejs"

    if nodejs_dir.is_dir():
        os.environ["PATH"] = (
            str(nodejs_dir)
            + os.pathsep
            + os.environ.get("PATH", "")
        )

    # winget may update the system PATH without updating the
    # environment of this already-running Python process.
    if not shutil.which("node") or not shutil.which("npm"):
        raise RuntimeError(
            "Node.js installation was attempted, but node/npm are "
            "not available in the current process yet.\n"
            "Close and reopen your terminal, then rerun:\n"
            "python setup.py"
        )

    print("Node.js LTS and npm are available.")


def check_node_and_npm():
    """Check Node.js/npm and required frontend project files."""
    node = shutil.which("node")
    npm = shutil.which("npm")

    if not node or not npm:
        install_nodejs_with_winget()

        node = shutil.which("node")
        npm = shutil.which("npm")

    if not node or not npm:
        raise RuntimeError(
            "Node.js and npm are required for the frontend. "
            "Install Node.js LTS and rerun setup.py."
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


# ============================================================
# Dependency installation
# ============================================================

def create_virtual_environment():
    """Create or reuse the project's Python virtual environment."""
    python_executable = (
        VENV_DIR
        / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
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
    """Install backend dependencies from requirements.txt."""
    if not REQUIREMENTS_FILE.is_file():
        raise RuntimeError(
            f"Backend requirements file was not found: "
            f"{REQUIREMENTS_FILE}"
        )

    run_command([
        python_executable,
        "-m",
        "pip",
        "install",
        "-r",
        REQUIREMENTS_FILE,
    ])

    print("Backend dependencies are ready.")


def install_frontend_dependencies():
    """Install frontend dependencies when they are not available."""
    npm = shutil.which("npm")

    if not npm:
        raise RuntimeError(
            "npm is unavailable. Install or repair Node.js/npm, "
            "then rerun setup.py."
        )

    node_modules = FRONTEND_DIR / "node_modules"
    vite_executable = node_modules / (
        ".bin/vite.cmd" if os.name == "nt" else ".bin/vite"
    )

    if node_modules.is_dir() and vite_executable.exists():
        print("Existing frontend dependencies detected; reusing them.")
        return

    print(
        "Installing frontend dependencies using package-lock.json..."
    )
    run_command([npm, "ci"], cwd=FRONTEND_DIR)

    print("Frontend dependencies are ready.")


# ============================================================
# Directory and database preparation
# ============================================================

def prepare_data_directory():
    """Create runtime directories without deleting existing data."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    if DATABASE_FILE.exists():
        print(f"Existing database preserved: {DATABASE_FILE}")
    else:
        print(
            "No database file exists yet; "
            "the application may initialize it."
        )


# ============================================================
# Service health checks
# ============================================================

def is_port_open(host, port):
    """Return True when a TCP connection can be established."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as connection:
        connection.settimeout(1)
        return connection.connect_ex((host, port)) == 0


def is_backend_healthy():
    """Check the backend health endpoint."""
    try:
        with urlopen(
            f"http://{BACKEND_HOST}:{BACKEND_PORT}/health",
            timeout=2,
        ) as response:
            return response.status == 200
    except (URLError, TimeoutError, OSError):
        return False


def is_frontend_healthy():
    """Check whether the frontend responds successfully."""
    try:
        with urlopen(
            f"http://{FRONTEND_HOST}:{FRONTEND_PORT}/",
            timeout=2,
        ) as response:
            return response.status == 200
    except (URLError, TimeoutError, OSError):
        return False


# ============================================================
# Process management
# ============================================================

def start_process(command, cwd, log_file):
    """Start a service with output redirected to its log file."""
    log_file.parent.mkdir(parents=True, exist_ok=True)
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
        # The child process inherits the redirected output handle.
        log_handle.close()

    return process


def ensure_backend_running(python_executable):
    """Reuse a healthy backend or start a new instance."""
    if is_backend_healthy():
        print("Flask backend is already healthy; reusing it.")
        return

    if is_port_open(BACKEND_HOST, BACKEND_PORT):
        raise RuntimeError(
            f"Port {BACKEND_PORT} is occupied, but the service did "
            "not pass the MotoMate /health check. "
            "No process was terminated."
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
            print(
                f"Flask backend is ready at "
                f"http://{BACKEND_HOST}:{BACKEND_PORT}"
            )
            return

    raise RuntimeError(
        "Flask backend did not become healthy within 20 seconds. "
        f"Check the log: {BACKEND_LOG}"
    )


def ensure_frontend_running():
    """Reuse a healthy frontend or start a new Vite instance."""
    if is_frontend_healthy():
        print("Vite frontend is already healthy; reusing it.")
        return

    if is_port_open(FRONTEND_HOST, FRONTEND_PORT):
        raise RuntimeError(
            f"Port {FRONTEND_PORT} is occupied, but the frontend "
            "did not respond successfully. "
            "No process was terminated."
        )

    npm = shutil.which("npm")

    if not npm:
        raise RuntimeError(
            "npm is unavailable; cannot start the frontend."
        )

    print("Starting Vite frontend...")

    start_process(
        [
            npm,
            "run",
            "dev",
            "--",
            "--host", FRONTEND_HOST,
            "--port", str(FRONTEND_PORT),
            "--strictPort",
        ],
        FRONTEND_DIR,
        FRONTEND_LOG,
    )

    for _ in range(30):
        time.sleep(1)

        if is_frontend_healthy():
            print(
                f"Vite frontend is ready at "
                f"http://{FRONTEND_HOST}:{FRONTEND_PORT}"
            )
            return

    raise RuntimeError(
        "Vite frontend did not become ready within 30 seconds. "
        f"Check the log: {FRONTEND_LOG}"
    )


# ============================================================
# Main setup workflow
# ============================================================

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
    print(f"Frontend: http://{FRONTEND_HOST}:{FRONTEND_PORT}")
    print(f"Backend:  http://{BACKEND_HOST}:{BACKEND_PORT}")
    print(f"Backend log:  {BACKEND_LOG}")
    print(f"Frontend log: {FRONTEND_LOG}")
    print("=" * 48)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        print(
            f"\nERROR: A command failed with exit code "
            f"{error.returncode}.",
            file=sys.stderr,
        )
        sys.exit(error.returncode or 1)
    except (RuntimeError, OSError) as error:
        print(f"\nERROR: {error}", file=sys.stderr)
        sys.exit(1)
