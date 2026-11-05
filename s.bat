@echo off
setlocal enabledelayedexpansion
title Inkloom AI - High Performance Platform

echo =====================================================================
echo           INKLOOM AI - HIGH PERFORMANCE BRAND PLATFORM
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
echo       - Network Devices:  http://!LOCAL_IP!:3000
echo       - Database Studio:  http://localhost:3000/dashboard/database
echo.

:: 3. Auto-open browser after server spins up
echo [3/3] Launching browser & starting server...
start /b powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2; try { Start-Process 'http://localhost:3000' } catch { cmd /c start http://localhost:3000 }"

:: 4. Background Public Tunnel (Optional / Non-blocking)
if exist "%~dp0node_modules\localtunnel\bin\lt.js" (
    start "Inkloom Public Tunnel" /min cmd /c "timeout /t 3 /nobreak >nul && node \"%~dp0node_modules\localtunnel\bin\lt.js\" --port 3000"
)

echo.
echo =====================================================================
echo  SERVER READY
echo  Press Ctrl+C anytime to stop the server.
echo =====================================================================
echo.

:: 5. Launch Next.js directly via Node (100%% bulletproof against npx/PowerShell script bugs)
if exist "%~dp0node_modules\next\dist\bin\next" (
    node "%~dp0node_modules\next\dist\bin\next" dev -H 0.0.0.0 -p 3000
) else (
    node_modules\.bin\next.cmd dev -H 0.0.0.0 -p 3000
)
