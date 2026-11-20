@echo off
setlocal
cd /d "%~dp0"
title PAWALERT - Animal Rescue & Emergency Dispatch Platform

echo ==============================================================
echo   PAWALERT: Animal Rescue & Emergency Dispatch Platform
echo   "Every Life Matters. Every Alert Counts."
echo ==============================================================
echo.

:: 1. Ensure uploads/ and .mongo-data/ directories exist
if not exist "uploads" (
    echo [1/4] Creating local uploads directory...
    mkdir uploads
)
if not exist ".mongo-data" (
    mkdir .mongo-data
)

:: 2. Ensure .env.local exists with MONGODB_URI
if not exist ".env.local" (
    if exist ".env.example" (
        echo [2/4] Initializing .env.local from template...
        copy /y ".env.example" ".env.local" >nul
    ) else (
        echo [2/4] Creating default .env.local...
        (
            echo MONGODB_URI=mongodb://127.0.0.1:27017/pawalert
            echo JWT_SECRET=pawalert_super_secret_jwt_key_2026
            echo ADMIN_EMAIL=admin@pawalert.org
            echo ADMIN_PASSWORD=AdminPass2026!
            echo NEXT_PUBLIC_APP_URL=http://localhost:3000
        ) > ".env.local"
    )
)

:: 3. Try to start MongoDB service if present locally
echo [3/4] Checking local MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo   - Local MongoDB service is running.
) else (
    echo   - Local MongoDB check completed.
)

:: 4. Verify Node.js environment
echo [4/4] Verifying Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not found on your system PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo.
echo Launching PawAlert Dispatch Platform and opening browser...
echo.

node scripts/launch.js

echo.
echo ==============================================================
echo [INFO] PawAlert process has ended.
echo ==============================================================
pause
