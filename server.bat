@echo off
setlocal enabledelayedexpansion
title Inkloom AI - Production Server
cd /d "%~dp0"

echo =====================================================================
echo        INKLOOM AI - PRODUCTION HIGH-SPEED SERVER
echo =====================================================================
echo.

:: 1. Clear any stuck process holding port 3000
echo [1/4] Checking port 3000 availability...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo       Releasing stale process on port 3000 (PID: %%p)...
    taskkill /F /PID %%p >nul 2>&1
)

:: 2. Ensure production build exists
echo [2/4] Verifying production build...
if not exist "%~dp0.next\BUILD_ID" (
    echo       No build found. Compiling production bundle (takes ~10s)...
    node "%~dp0node_modules\next\dist\bin\next" build
    if errorlevel 1 (
        echo [Inkloom] Build failed.
        pause
        exit /b 1
    )
)

:: 3. Launch smart browser monitor
echo [3/4] Launching browser monitor...
if exist "%~dp0scripts\open-browser.js" (
    start "Inkloom Browser Waiter" /min node "%~dp0scripts\open-browser.js" http://localhost:3000
) else (
    start "" /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"
)

:: 4. Start Production Server
echo [4/4] Starting Production Server on http://localhost:3000 ...
echo.
echo =====================================================================
echo  PRODUCTION HIGH-SPEED SERVER ACTIVE
echo  Local:    http://localhost:3000
echo  Database: http://localhost:3000/dashboard/database
echo.
echo  IMPORTANT: KEEP THIS WINDOW OPEN WHILE USING INKLOOM!
echo  (Minimizing this window is completely fine. Closing it stops the server.)
echo =====================================================================
echo.

if exist "%~dp0node_modules\next\dist\bin\next" (
    node "%~dp0node_modules\next\dist\bin\next" start -p 3000
) else (
    call npm run start
)

if errorlevel 1 (
    echo.
    echo =====================================================================
    echo [Inkloom] Server exited with code %errorlevel%.
    echo =====================================================================
    pause
)
