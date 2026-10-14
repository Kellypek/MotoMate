# 🏍️ MotoMate

**Your Motorcycle Maintenance Mate**

A web-based motorcycle maintenance tracker built with React, Flask, and SQLite.

## Features

- Motorcycle registration and mileage management
- Maintenance record management
- Service interval and remaining distance calculation
- Automated environment setup and application startup

## Tech Stack

- Frontend: React, Vite
- Backend: Python, Flask
- Database: SQLite
- Infrastructure Automation: Python
- Testing: pytest

## Prerequisites

- Windows 10/11
- Python 3.12 or later
- Internet connection for initial dependency installation

Node.js and npm are checked by the setup script. If they are missing, the script attempts to install them using the available Windows package manager. If automatic installation is unavailable or fails, install Node.js LTS manually and rerun the setup script.

## Quick Start

Clone the repository:

```bash
git clone https://github.com/Kellypek/MotoMate.git
cd MotoMate
```

Run the IaC setup script:

```bash
python setup.py
```

The script checks the required environment, prepares the Python virtual environment, installs dependencies, creates required directories, and starts the backend and frontend services.

After successful startup, access the application at:

- Frontend: http://127.0.0.1:5173
- Backend: http://127.0.0.1:5000

**Note:** Python, Node.js, and npm must be installed before running the script. The script automates application environment setup but does not install Node.js itself.

## Project Structure

```text
MotoMate/
├── setup.py
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── requirements.txt
│   ├── routes/
│   ├── services/
│   ├── tests/
│   └── data/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── jsconfig.json
│   ├── package-lock.json
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── components.json
├── .gitignore
├── project_paths.txt
├── pytest.ini
├── README.md
└── setup.py
```

## Testing

Run the automated test suite:

```bash
python -m pytest
```

## Infrastructure as Code

MotoMate uses a Python-based setup script to automate environment preparation, dependency installation, directory creation, and application startup. The script is designed to reuse existing resources and services when possible, supporting repeatable and idempotent execution.
