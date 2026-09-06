@echo off
title OmniFlow Server Control - RESTART
color 0e
echo ===================================================
echo   Restarting OmniFlow Server on Port 4000...
echo ===================================================
echo.

cd /d "%~dp0"
set "port=4000"

:: 1. Stop any running instance on port 4000
echo 1. Stopping any existing instances on port %port%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%port%') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

:: 2. Boot up new server
echo 2. Booting up new OmniFlow server instance...
start "OmniFlow Backend Server" cmd /k "npm run dev"

:: 3. Open browser
timeout /t 4 /nobreak >nul
echo 3. Opening Swagger API Documentation at http://localhost:4000/api/docs...
start http://localhost:4000/api/docs

echo.
echo [OK] OmniFlow server successfully restarted on Port 4000!
echo.
pause
