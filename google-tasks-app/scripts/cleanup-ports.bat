@echo off
setlocal enabledelayedexpansion

echo Checking for processes using ports 3000 and 4000...
echo WARNING: This will only kill processes using ports 3000 and 4000.
echo If you have other applications using these ports, they will be stopped.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

REM Function to check if process is related to our project
:is_project_process
set "pid=%~1"
set "is_project=0"

REM Get process name
for /f "tokens=1" %%a in ('tasklist /fi "PID eq !pid!" /nh') do (
    set "proc_name=%%a"
)

REM Check if process is related to our project
if /i "!proc_name!"=="node.exe" set "is_project=1"
if /i "!proc_name!"=="npm.exe" set "is_project=1"
if /i "!proc_name!"=="docker.exe" set "is_project=1"
if /i "!proc_name!"=="docker-compose.exe" set "is_project=1"
if /i "!proc_name!"=="powershell.exe" set "is_project=1"
if /i "!proc_name!"=="cmd.exe" set "is_project=1"

exit /b !is_project!

REM Function to kill process on a specific port
:kill_port
set "port=%~1"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%port% " ^| findstr "LISTENING"') do (
    set "pid=%%a"
    call :is_project_process !pid!
    if !errorlevel! equ 1 (
        echo Found project process using port %port% with PID: !pid!
        echo Attempting to kill process...
        taskkill /F /PID !pid!
        if !errorlevel! equ 0 (
            echo Successfully killed process on port %port%
        ) else (
            echo Failed to kill process on port %port%
        )
    ) else (
        echo Found non-project process using port %port% with PID: !pid! (!proc_name!)
        echo Skipping this process as it's not related to our project.
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