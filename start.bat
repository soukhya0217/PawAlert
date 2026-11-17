@echo off
setlocal
cd /d "%~dp0"
title POWER ALERT - Production Animal Rescue Platform

echo ==============================================================
echo   POWER ALERT: Animal Rescue Platform
echo   "Every Life Matters. Every Alert Counts."
echo ==============================================================
echo.

if not exist ".env.local" (
    if exist ".env.example" (
        echo [1/3] Initializing environment settings...
        copy /y ".env.example" ".env.local" >nul
    )
)

echo [2/3] Verifying Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not found on your system PATH!
    echo Please install Node.js (version 18 or 20) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [3/3] Launching POWER ALERT and opening browser...
echo.

node scripts/launch.js

if %errorlevel% neq 0 (
    echo.
    echo ==============================================================
    echo [NOTICE] Application process finished with code %errorlevel%.
    echo If this was unexpected, review the messages above.
    echo ==============================================================
    pause
)
