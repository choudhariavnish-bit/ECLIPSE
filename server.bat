@echo off
setlocal enabledelayedexpansion
title Inkloom AI - Production Server

echo =====================================================================
echo        INKLOOM AI - PRODUCTION HIGH-SPEED SERVER
echo =====================================================================
echo.

:: 1. Clear any stuck process holding port 3000
echo [1/3] Checking port 3000 availability...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo       Releasing port 3000 (PID: %%p)...
    taskkill /F /PID %%p >nul 2>&1
)

:: 2. Auto-open browser in background
echo [2/3] Launching browser...
start "" /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: 3. Start Production Server
echo [3/3] Starting Production Server on http://localhost:3000 ...
echo.
echo =====================================================================
echo  PRODUCTION SERVER RUNNING
echo  Local:    http://localhost:3000
echo  Database: http://localhost:3000/dashboard/database
echo  Press Ctrl+C to terminate.
echo =====================================================================
echo.

if exist "%~dp0node_modules\next\dist\bin\next" (
    node "%~dp0node_modules\next\dist\bin\next" start -p 3000 -H 0.0.0.0
) else (
    call npm run start
)

if errorlevel 1 (
    echo.
    echo [Inkloom] Server exited with error code %errorlevel%.
    pause
)
