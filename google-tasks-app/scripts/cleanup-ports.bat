@echo off
setlocal enabledelayedexpansion

echo Checking for processes using ports 3000 and 4000...
echo WARNING: This will only kill processes using ports 3000 and 4000.
echo If you have other applications using these ports, they will be stopped.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

REM Function to kill process on a specific port
:kill_port
set "port=%~1"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%port% " ^| findstr "LISTENING"') do (
    echo Found process using port %port% with PID: %%a
    echo Attempting to kill process...
    taskkill /F /PID %%a
    if !errorlevel! equ 0 (
        echo Successfully killed process on port %port%
    ) else (
        echo Failed to kill process on port %port%
    )
)
goto :eof

REM Check and kill processes on port 3000
call :kill_port 3000

REM Check and kill processes on port 4000
call :kill_port 4000

echo.
echo Port cleanup complete.
echo You can now run the development script.
pause 