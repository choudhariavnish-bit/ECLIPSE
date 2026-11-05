@echo off
setlocal enabledelayedexpansion
title Inkloom AI - Enterprise Brand Governance Platform

echo =====================================================================
echo           INKLOOM AI - ENTERPRISE GOVERNANCE PLATFORM
echo =====================================================================
echo.

:: 1. Clear any stuck process holding port 3000
echo [1/3] Checking port 3000 availability...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo       Releasing port 3000 (PID: %%p)...
    taskkill /F /PID %%p >nul 2>&1
)

:: 2. Find local IPv4 address
set LOCAL_IP=localhost
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" 2^>nul') do (
    set CURRENT_IP=%%a
    set CURRENT_IP=!CURRENT_IP: =!
    if not "!CURRENT_IP!"=="127.0.0.1" (
        if not "!CURRENT_IP!"=="" set LOCAL_IP=!CURRENT_IP!
    )
)

echo [2/3] Network endpoints configured:
echo       - Local Machine:    http://localhost:3000
echo       - Any Wi-Fi Device: http://!LOCAL_IP!:3000
echo       - Database Studio:  http://localhost:3000/dashboard/database
echo.

:: 3. Auto-open browser in background (native Windows cmd, zero PowerShell dependency)
echo [3/3] Starting server & auto-launching browser...
start "" /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

echo =====================================================================
echo  SERVER READY
echo  Local:    http://localhost:3000
echo  Database: http://localhost:3000/dashboard/database
echo  Press Ctrl+C anytime to stop.
echo =====================================================================
echo.

:: 4. Launch Next.js directly via Node (immune to npx/PowerShell bugs)
if exist "%~dp0node_modules\next\dist\bin\next" (
    node "%~dp0node_modules\next\dist\bin\next" dev -H 0.0.0.0 -p 3000
) else (
    call npm run dev
)

if errorlevel 1 (
    echo.
    echo [Inkloom] Server exited with error code %errorlevel%.
    pause
)
