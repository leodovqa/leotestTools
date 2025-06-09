@echo off
setlocal enabledelayedexpansion

REM Change to the project directory (where the script is located)
cd /d "%~dp0.."

echo Running code quality checks...
echo.

echo Running Prettier auto-fix...
npx prettier --write "**/*.{js,jsx,ts,tsx,json,css,scss,md}"
if %errorlevel% neq 0 (
    echo.
    echo Error: Prettier auto-fix failed.
    echo.
    exit /b 1
)

echo.
echo Running ESLint check...
npm run lint
if %errorlevel% neq 0 (
    echo.
    echo ESLint found issues that need to be fixed.
    echo.
    exit /b 1
)

echo.
echo All checks passed successfully!
echo.

pause 