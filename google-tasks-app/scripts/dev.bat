@echo off
setlocal enabledelayedexpansion

REM Change to the project directory (where the script is located)
cd /d "%~dp0.."

echo Starting development environment...

REM Check if Docker is running
docker info > nul 2>&1
if errorlevel 1 (
    echo Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Check if docker-compose is installed
docker-compose version > nul 2>&1
if errorlevel 1 (
    echo docker-compose is not installed. Please install it and try again.
    exit /b 1
)

REM Check if port 3000 is in use
netstat -ano | findstr :3000 > nul
if not errorlevel 1 (
    echo Port 3000 is already in use. Please free up the port and try again.
    exit /b 1
)

REM Check for uncommitted changes
git status --porcelain > nul 2>&1
if not errorlevel 1 (
    echo Warning: You have uncommitted changes in your repository.
    echo This is safe to continue, but make sure to commit your changes when ready.
    echo.
    choice /C YN /M "Do you want to continue"
    if errorlevel 2 exit /b 1
)

echo Building and starting containers...
echo Note: This will not affect your local files or Git repository.
echo.

REM Start containers without removing volumes on exit
docker-compose up --build

REM Cleanup on exit (without removing volumes)
:cleanup
echo Stopping containers...
docker-compose down
exit /b 0 