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

echo.
echo Choose development environment:
echo 1. Docker (recommended for consistent development)
echo 2. Local (faster but requires local Node.js setup)
echo.

choice /C 12 /M "Select development environment"
if errorlevel 2 goto local_dev
if errorlevel 1 goto docker_dev

:docker_dev
echo.
echo Starting Docker development environment...
echo Note: This will not affect your local files or Git repository.
echo.

REM Start containers without removing volumes on exit
docker-compose up --build
goto cleanup

:local_dev
echo.
echo Starting local development environment...
echo.

REM Check if Node.js is installed
node --version > nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js to use local development.
    exit /b 1
)

REM Check if npm is installed
npm --version > nul 2>&1
if errorlevel 1 (
    echo Error: npm is not installed. Please install npm to use local development.
    exit /b 1
)

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Start local development server
npm run dev
goto cleanup

:cleanup
echo Stopping development environment...
if "%errorlevel%"=="1" (
    docker-compose down
)
exit /b 0 