@echo off
setlocal enabledelayedexpansion
title POWER ALERT - Animal Rescue Platform
cd /d "%~dp0"

echo ==============================================================
echo   POWER ALERT: Animal Rescue & Welfare Management Platform
echo   "Every Life Matters. Every Alert Counts."
echo ==============================================================
echo.

:: 1. Verify Node.js installation
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js was not detected on your system.
    echo Please install Node.js from https://nodejs.org/ (v18 or higher recommended).
    echo.
    pause
    exit /b 1
)

:: 2. Ensure environment configuration exists
if not exist ".env.local" (
    if exist ".env.example" (
        echo [INFO] Initializing .env.local from template...
        copy /y ".env.example" ".env.local" >nul
    ) else (
        echo [INFO] Creating default .env.local...
        (
            echo NEXT_PUBLIC_APP_URL=http://localhost:3000
            echo JWT_SECRET=power-alert-local-dev-jwt-secret-key-2026
            echo RESEND_API_KEY=re_dummy_token
            echo EMAIL_FROM=POWER ALERT ^<alerts@poweralert.org^>
        ) > ".env.local"
    )
)

:: 3. Check dependencies
if not exist "node_modules" (
    echo [INFO] Installing platform dependencies (first-time setup)...
    call npm install --legacy-peer-deps
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Dependency installation encountered an issue.
        pause
        exit /b %ERRORLEVEL%
    )
)

echo [INFO] Initializing POWER ALERT Dispatch Engine...
echo [INFO] Opening default web browser to http://localhost:3000 ...
echo.

:: 4. Launch web browser in parallel after 3 seconds so the server is ready
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: 5. Launch the Next.js server
call npm run dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo [NOTICE] Server stopped.
    pause
)
