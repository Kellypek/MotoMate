# 🏍️ MotoMate

**Your Motorcycle Maintenance Mate**

MotoMate is a web-based motorcycle maintenance tracking application developed using React, Flask, and SQLite. It allows users to manage motorcycle information, track mileage, record maintenance activities, and calculate upcoming service intervals.

This project demonstrates Infrastructure as Code (IaC) principles through a Python-based setup script that automates environment preparation, dependency installation, directory creation, and application startup.

## 1. Features

- **Motorcycle Management:** Register motorcycles and manage their details, registration numbers, and current mileage.
- **Maintenance Tracking:** Record maintenance activities, service dates, service mileage, costs, and notes.
- **Service Interval Calculation:** Calculate the next recommended service mileage and the remaining distance before the next service.
- **Automated Environment Setup:** Check prerequisites and prepare the required application environment.
- **Dependency Installation:** Install backend and frontend dependencies using pip and npm.
- **Automated Application Startup:** Start the backend and frontend services through the setup script.
- **Automated Testing:** Run backend tests using pytest.

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, Flask |
| Database | SQLite |
| Infrastructure Automation | Python |
| Backend Package Management | pip |
| Frontend Package Management | npm |
| Testing Framework | pytest |
| Version Control | Git and GitHub |

## 3. Prerequisites

Before running MotoMate, ensure that the following requirements are met:

- Windows 10 or Windows 11
- Python 3.12 or later
- Internet access for downloading dependencies
- Sufficient permissions to create files and install dependencies

Node.js and npm are also required for the frontend. The setup script checks whether they are available and attempts to install Node.js LTS using `winget` on supported Windows systems. If automatic installation is unavailable or unsuccessful, install Node.js LTS manually and rerun the setup script.

To verify the installed Python version, open PowerShell and execute:

```powershell
python --version
```

The output should indicate Python 3.12 or a later version.

## 4. Installation and Quick Start

### Step 1: Download the Repository

Clone the repository using Git:

```bash
git clone https://github.com/Kellypek/MotoMate.git
cd MotoMate
```

Alternatively, download the repository as a ZIP file from GitHub and extract it to a local directory.

### Step 2: Run the IaC Setup Script

From the project root directory, execute:

```bash
python setup.py
```

The setup script automates the main environment preparation and application startup tasks. Depending on the existing environment, it checks the required tools, creates or reuses the Python virtual environment, installs backend and frontend dependencies, creates required directories, and starts the application services.

Follow any instructions displayed in the terminal if a prerequisite cannot be installed automatically.

**Important:** Run the command from the project root directory, where `setup.py` is located.

### Step 3: Access the Application

After the setup script completes successfully, open the following URLs in a web browser on the same computer where MotoMate is running:

- **Frontend:** http://127.0.0.1:5173
- **Backend:** http://127.0.0.1:5000

The frontend provides the user interface, while the backend handles application requests and database operations.

### Step 4: Stop and Restart the Application

Use the method supported by the setup script and the terminal or process window in which each service is running to stop the services.

To run the setup process again, return to the project root directory and execute:

```bash
python setup.py
```

The script is designed to reuse existing resources and avoid unnecessary setup operations. If a service is already running, the script should handle it according to its implemented startup checks.

## 5. Infrastructure as Code Design Decisions

MotoMate uses a Python-based IaC script to automate environment preparation and application startup. The script is designed to reduce manual configuration and make the setup process more repeatable.

### 5.1 Automation

A single command, `python setup.py`, coordinates the main setup tasks. This reduces the number of manual installation and configuration steps and makes the project easier for another developer or evaluator to run.

### 5.2 Idempotency

The setup script is designed to support repeated execution without unnecessarily recreating existing resources. It checks for existing environments, dependencies, directories, and running services before performing relevant setup operations.

This approach helps reduce duplicate work and unintended changes when the script is executed more than once. Idempotency should be verified by running the script repeatedly and checking that existing application data remains intact.

### 5.3 Dependency Management

Backend dependencies are specified in `backend/requirements.txt` and installed using pip. Frontend dependencies are defined in `frontend/package.json`, with exact dependency versions recorded in `frontend/package-lock.json`.

The setup script uses these files to manage dependencies instead of requiring users to install each package individually. The frontend lockfile also helps maintain consistency between installations.

### 5.4 Directory and Database Protection

The script creates the directories required by the application, including those used for database files and logs. Existing application data should be preserved during repeated setup runs rather than being replaced with a new database.

Separating generated files from source code also makes the repository easier to maintain and helps prevent local database files from being committed accidentally.

### 5.5 Application Startup and Logging

The setup script coordinates backend and frontend startup and uses its implemented checks to avoid unnecessary duplicate service processes. Log files help developers investigate installation and startup problems.

Centralising these tasks in the setup script makes the deployment procedure easier to follow and troubleshoot.

### 5.6 Maintainability

The setup logic is separated from the backend routes and frontend components. Dependency definitions are maintained in their respective configuration files, while the setup script coordinates the environment preparation process.

This separation improves readability and makes the automation logic easier to maintain as the application develops.

## 6. Testing

MotoMate uses pytest to test backend functionality, including motorcycle management, maintenance records, and maintenance service calculations.

Run the test suite from the project root directory:

```bash
python -m pytest
```

Review the terminal output to determine whether the tests passed. Resolve any failures before considering the test run successful.

### IaC Setup Verification

The setup script should also be tested in a clean Windows virtual machine or another fresh environment.

The recommended verification procedure is:

1. Install the required Python version and prepare the clean environment.
2. Download the MotoMate repository.
3. Run `python setup.py` and check for setup errors.
4. Confirm that the backend and frontend start successfully.
5. Open the frontend and verify that the application works.
6. Run `python -m pytest` and record the test results.
7. Run `python setup.py` again to check repeated execution.
8. Confirm that existing database records are not unintentionally lost or overwritten.

These checks help demonstrate that the setup process is repeatable and that the application can run outside the original development environment.

## 7. Project Structure

```text
MotoMate/
├── setup.py
├── README.md
├── pytest.ini
├── .gitignore
├── project_paths.txt
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── requirements.txt
│   ├── routes/
│   ├── services/
│   ├── tests/
│   └── data/
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── hooks/
    │   ├── App.jsx
    │   ├── api.js
    │   ├── index.css
    │   └── main.jsx
    ├── public/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── eslint.config.js
    └── components.json
```

The `backend/` directory contains the Flask application, database logic, routes, services, and automated tests. The `frontend/` directory contains the React application and its configuration files. The root-level `setup.py` coordinates environment setup and application startup.

## 8. Limitations

- The current setup process is designed primarily for Windows environments.
- Automatic Node.js installation depends on the availability of `winget`, internet access, and sufficient permissions.
- Initial dependency installation requires an internet connection.
- The application is intended for local development and educational demonstration. Additional security, configuration, and deployment work would be required before production use.

## 9. Project Repository

GitHub: https://github.com/Kellypek/MotoMate

## 10. Purpose

MotoMate demonstrates how Infrastructure as Code principles can be applied to a web application project. By automating environment preparation, dependency installation, directory creation, and application startup, the project aims to improve repeatability, reduce manual effort, and simplify application setup for other users.

This project was developed for educational purposes as part of a DevOps and Infrastructure as Code assignment.