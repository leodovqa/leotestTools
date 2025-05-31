@echo off
setlocal enabledelayedexpansion

REM Change to the project directory (where the script is located)
cd /d "%~dp0.."

echo Starting development environment...

REM Check for uncommitted changes (ignoring line endings)
git diff --quiet --ignore-cr-at-eol
if %errorlevel% neq 0 (
    echo WARNING: You have uncommitted changes in your repository.
    echo This is safe to continue, but make sure to commit your changes when ready.
    echo.
    choice /C YN /M "Do you want to continue"
    if errorlevel 2 exit /b 1
)

REM Check if Docker is running
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Please start Docker Desktop first.
    echo.
    echo Press any key to exit...
    pause > nul
    exit /b 1
)

REM Check if ports are in use
netstat -ano | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo Port 3000 is in use. Running cleanup script...
    call scripts\cleanup-ports.bat
)

netstat -ano | findstr ":4000" > nul
if %errorlevel% equ 0 (
    echo Port 4000 is in use. Running cleanup script...
    call scripts\cleanup-ports.bat
)

echo.
echo Choose development mode:
echo 1. Run with Docker (detached - terminal free for other commands)
echo 2. Run with Docker (attached - see all logs in terminal)
echo 3. Run without Docker (local development)
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Starting Docker in detached mode...
    echo Cleaning up existing containers...
    docker-compose down
    echo Rebuilding containers...
    docker-compose build --no-cache
    echo Starting containers in detached mode...
    docker-compose up -d
    
    REM Wait for the server to be ready
    echo Waiting for server to be ready...
    timeout /t 5 /nobreak > nul
    
    echo.
    echo Docker is running in detached mode.
    echo To view logs, run: docker-compose logs -f
    echo To stop Docker, run: docker-compose down
    echo.
    echo Opening application in browser...
    start http://localhost:4000
    exit /b 0
) else if "%choice%"=="2" (
    echo Starting Docker in attached mode...
    echo Cleaning up existing containers...
    docker-compose down
    echo Rebuilding containers...
    docker-compose build --no-cache
    echo Starting containers...
    
    REM Start the browser in a separate process
    start http://localhost:4000
    
    docker-compose up
) else if "%choice%"=="3" (
    echo Starting local development...
    
    REM Start the browser in a separate process
    start http://localhost:4000
    
    npm run dev
) else (
    echo Invalid choice. Please run the script again and select 1, 2, or 3.
    exit /b 1
)

pause 