@echo off
cd /d "%~dp0"
title POWER ALERT - Animal Rescue Platform

echo ==============================================================
echo   POWER ALERT: Animal Rescue Platform
echo   "Every Life Matters. Every Alert Counts."
echo ==============================================================
echo.

if not exist ".env.local" (
    if exist ".env.example" (
        echo [INFO] Creating .env.local configuration...
        copy /y ".env.example" ".env.local" >nul
    )
)

echo [1/2] Opening browser to http://localhost:3000 ...
start "" "http://localhost:3000"

echo [2/2] Starting POWER ALERT Next.js server...
echo.
echo ==============================================================
echo Server is running! Press Ctrl+C in this window to stop it.
echo ==============================================================
echo.

call npm run dev

echo.
echo [INFO] Next.js server process has terminated.
pause
