@echo off
setlocal enabledelayedexpansion

echo Checking for processes using ports 3000 and 4000...
echo WARNING: This will only kill processes using ports 3000 and 4000.
echo.

REM Function to kill a process on a specific port
:kill_port
set "port=%~1"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%port%"') do (
    set "pid=%%a"
    if not "!pid!"=="" (
        echo Found process !pid! using port %port%
        echo Killing process !pid!...
        taskkill /F /PID !pid!
    )
)
goto :eof

REM Check and kill processes on port 3000
call :kill_port 3000

REM Check and kill processes on port 4000
call :kill_port 4000

echo.
echo Port cleanup complete.
pause 
