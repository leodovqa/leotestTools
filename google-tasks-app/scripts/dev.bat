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

REM Check if ports are in use
netstat -ano | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo Port 3000 is in use. Running cleanup script...
    call scripts\cleanup-ports.bat
)

echo.
echo Starting local development...
echo.

set /p choice="Press Enter to continue..."

REM Start the browser in a separate process
start http://localhost:3000

npm run dev

pause 