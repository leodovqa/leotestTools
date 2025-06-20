@echo off
setlocal enabledelayedexpansion

REM Change to the project root directory
cd /d "%~dp0..\"

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

echo.
echo Starting local development...
echo Starting local development...
echo.

echo Starting local API server (server.js) on port 3001...
start /B cmd /C "node server.js"
REM Give the API server a moment to start up
timeout /t 2 /nobreak > NUL

echo Starting Vite dev server...
echo (A browser window will open automatically if configured in Vite)

REM Run Vite dev server in the same terminal
npm run dev

REM When npm run dev is stopped, kill the API server
for /f "tokens=2" %%a in ('tasklist ^| findstr /i "node.exe"') do taskkill /PID %%a /F > NUL 2>&1

echo Both servers stopped. Press any key to exit.
pause > nul 