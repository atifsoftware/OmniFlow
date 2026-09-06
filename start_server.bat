@echo off
title OmniFlow Server Control - START
color 0b
echo ===================================================
echo   Starting OmniFlow ERP NestJS Backend Server...
echo ===================================================
echo.

cd /d "%~dp0"

:: Launch the development server in a new window
start "OmniFlow Backend Server" cmd /k "npm run dev"

:: Wait for server bootup
timeout /t 4 /nobreak >nul

:: Open browser automatically to Swagger docs
echo Opening Swagger API Documentation at http://localhost:4000/api/docs...
start http://localhost:4000/api/docs

echo.
echo [OK] OmniFlow server successfully launched on Port 4000!
echo.
pause
