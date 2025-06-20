@echo off
set PRETTIER_STATUS=OK
set ESLINT_STATUS=OK

echo =============================
echo Running Prettier formatting
echo =============================

call npx prettier --write .
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Prettier failed to format some files.
    set PRETTIER_STATUS=FAIL
) else (
    echo.
    echo [SUCCESS] Prettier formatting completed.
)
echo [DONE] Prettier step finished.
echo.

echo =============================
echo Running ESLint autofix
echo =============================

call npx eslint . --fix
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] ESLint failed to fix all linting issues.
    set ESLINT_STATUS=FAIL
) else (
    echo.
    echo [SUCCESS] ESLint autofix completed.
)
echo [DONE] ESLint step finished.
echo.

echo =============================
echo SUMMARY
if "%PRETTIER_STATUS%"=="OK" (echo Prettier: Success) else (echo Prettier: FAIL)
if "%ESLINT_STATUS%"=="OK" (echo ESLint: Success) else (echo ESLint: FAIL)

if "%PRETTIER_STATUS%"=="OK" if "%ESLINT_STATUS%"=="OK" (
    echo [ALL DONE] Formatting and linting completed successfully.
    set exitCode=0
) else (
    echo [WARNING] There were errors during formatting or linting.
    set exitCode=1
)

exit /b %exitCode%