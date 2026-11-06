@echo off
setlocal enabledelayedexpansion
title Inkloom AI - Enterprise Brand Governance Platform
cd /d "%~dp0"

echo =====================================================================
echo           INKLOOM AI - ENTERPRISE GOVERNANCE PLATFORM
echo =====================================================================
echo.

:: 1. Clear any stuck process holding port 3000
echo [1/3] Checking port 3000 availability...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo       Releasing stale process on port 3000 (PID: %%p)...
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

echo [2/3] Network endpoints ready:
echo       - Primary:          http://localhost:3000
echo       - Alternative:      http://127.0.0.1:3000
echo       - Wi-Fi Devices:    http://!LOCAL_IP!:3000
echo       - Database Studio:  http://localhost:3000/dashboard/database
echo.

:: 3. Smart browser launcher - waits for server to answer before opening Chrome
echo [3/3] Starting server and smart browser monitor...
if exist "%~dp0scripts\open-browser.js" (
    start "Inkloom Browser Waiter" /min node "%~dp0scripts\open-browser.js" http://localhost:3000
) else (
    start "" /b cmd /c "timeout /t 6 /nobreak >nul && start http://localhost:3000"
)

echo.
echo =====================================================================
echo  SERVER STARTING UP...
echo  - Local:    http://localhost:3000
echo  - Database: http://localhost:3000/dashboard/database
echo.
echo  IMPORTANT: KEEP THIS WINDOW OPEN WHILE USING INKLOOM!
echo  (Minimizing this window is completely fine. Closing it stops the server.)
echo =====================================================================
echo.

:: 4. Launch Next.js dev server
if exist "%~dp0node_modules\next\dist\bin\next" (
    node "%~dp0node_modules\next\dist\bin\next" dev -p 3000
) else (
    call npm run dev
)

if errorlevel 1 (
    echo.
    echo =====================================================================
    echo [Inkloom] Server exited with code %errorlevel%.
    echo Check above for any error messages.
    echo =====================================================================
    pause
)
