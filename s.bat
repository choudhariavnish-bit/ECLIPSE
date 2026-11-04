@echo off
setlocal enabledelayedexpansion
title Inkloom AI - High Performance Platform

echo =====================================================================
echo           INKLOOM AI - HIGH PERFORMANCE BRAND PLATFORM
echo =====================================================================
echo.

:: 1. Automatically kill any stuck or orphaned process holding port 3000
echo [1/4] Checking and clearing port 3000...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo       Terminating stuck process (PID %%p) on port 3000...
    taskkill /F /PID %%p >nul 2>&1
)

:: 2. Find local IPv4 address for multi-device network access
set LOCAL_IP=localhost
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set CURRENT_IP=%%a
    set CURRENT_IP=!CURRENT_IP: =!
    if not "!CURRENT_IP!"=="127.0.0.1" (
        set LOCAL_IP=!CURRENT_IP!
    )
)

echo [2/4] Network endpoints configured:
echo       - Local Machine:    http://localhost:3000
echo       - Any Wi-Fi Device: http://!LOCAL_IP!:3000
echo.

:: 3. Smart browser launcher: monitors localhost:3000 and opens browser the exact second server responds
echo [3/4] Background smart browser launcher activated...
start "Inkloom Browser Launcher" /b cmd /c "for /l %%i in (1,1,60) do (curl.exe -s -I http://localhost:3000 >nul 2>&1 && (start http://localhost:3000 & exit) || ping 127.0.0.1 -n 2 >nul)"

:: 4. Start zero-config public tunnel for remote/mobile access once server is active
echo [4/4] Activating public tunnel launcher...
start "Inkloom Public Tunnel (Access from ANY remote device/cellular)" cmd /c "echo Waiting for server on port 3000 to start... && for /l %%i in (1,1,60) do (curl.exe -s -I http://localhost:3000 >nul 2>&1 && (echo Server is ready! Generating live public URL... && npx lt --port 3000 & exit) || ping 127.0.0.1 -n 2 >nul)"

echo.
echo =====================================================================
echo  STARTING INKLOOM SERVER (Rust Turbopack Enabled)
echo.
echo  Access Options:
echo  1. Local Machine:    http://localhost:3000 (Opens automatically)
echo  2. Any Wi-Fi Device: http://!LOCAL_IP!:3000
echo  3. Mobile/Cellular:  Check companion Tunnel window for public URL
echo =====================================================================
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

:: Start Next.js with Turbopack for instant 2-second boot and zero lag
call npx next dev -H 0.0.0.0 -p 3000 --turbopack
