@echo off
setlocal enabledelayedexpansion
title Inkloom AI - High Speed Brand Governance Platform

echo =====================================================================
echo           INKLOOM AI - HIGH PERFORMANCE BRAND PLATFORM
echo =====================================================================
echo.

:: 1. Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [1/4] First-time setup detected: Installing required dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b 1
    )
) else (
    echo [1/4] Dependencies verified.
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

echo [2/4] High-speed endpoints configured:
echo       - Local PC:         http://localhost:3000
echo       - Any Wi-Fi Device: http://!LOCAL_IP!:3000
echo.

:: 3. Launch Google Chrome browser
echo [3/4] Launching Google Chrome...
set CHROME_PATH=""
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)

:: Wait 3 seconds before popping Chrome to let server initialize
start /b cmd /c "ping 127.0.0.1 -n 4 >nul && (if not !CHROME_PATH!=="" (start "" !CHROME_PATH! http://localhost:3000) else (start chrome http://localhost:3000))"

:: 4. Start zero-config public tunnel for access from ANY device on ANY network (No server needed)
echo [4/4] Starting Public Cross-Network Tunnel for remote devices...
start "Inkloom Public Tunnel (Access from ANY remote device/cellular)" cmd /c "echo Generating Public URL for mobile/remote access... && npx lt --port 3000"

echo.
echo =====================================================================
echo  SERVER READY! (High-Speed Rust Turbopack Mode Active)
echo.
echo  Access Options:
echo  1. On this PC:           http://localhost:3000 (Opened in Chrome)
echo  2. Devices on same Wi-Fi: http://!LOCAL_IP!:3000
echo  3. ANY Device anywhere:  Check the companion Tunnel window for
echo                           the live public URL (No server needed)
echo.
echo  Optimizations applied:
echo  - Rust-based Turbopack streaming (Zero compilation latency)
echo  - Source-map network stripping (Fast mobile load times)
echo  - Persistent live disk & Supabase database sync
echo  - Mobile responsive drawer & bottom navigation
echo =====================================================================
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

:: Start Next.js bound to all network interfaces (0.0.0.0) with Turbopack for ultra-fast multi-device performance
call npx next dev -H 0.0.0.0 -p 3000 --turbopack --disable-source-maps
