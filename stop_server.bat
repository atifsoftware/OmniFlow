@echo off
title OmniFlow Server Control - STOP
color 0c
echo ===================================================
echo   Stopping OmniFlow Server on Port 4000...
echo ===================================================
echo.

cd /d "%~dp0"
setlocal enabledelayedexpansion
set "port=4000"
set "found=0"

:: Search process ID listening on port 4000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%port%') do (
    set "pid=%%a"
    if not "!pid!"=="" (
        set /a "found+=1"
        echo Stopping running OmniFlow instance [PID: !pid!]...
        taskkill /F /PID !pid! >nul 2>&1
    )
)

if !found! equ 0 (
    echo [INFO] No active OmniFlow process found listening on port 4000.
) else (
    echo [OK] Successfully stopped OmniFlow server on port 4000.
)

echo.
pause
