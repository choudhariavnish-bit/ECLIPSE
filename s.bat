@echo off
title Inkloom AI Platform

echo =====================================================================
echo           INKLOOM AI - HIGH PERFORMANCE BRAND PLATFORM
echo =====================================================================
echo.

:: 1. Ultra-fast port check & release (sub-50ms)
node -e "const s=require('net').createConnection(3000,'127.0.0.1',()=>{s.destroy();require('child_process').exec('for /f \"tokens=5\" %%p in (\'netstat -ano -p tcp ^| findstr :3000 ^| findstr LISTENING\') do taskkill /f /pid %%p');});s.on('error',()=>{s.destroy();});" >nul 2>&1

:: 2. Auto-launch browser
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

echo [Inkloom] Starting Turbopack engine (~1.5s startup)...
echo  - Local:           http://localhost:3000
echo  - Database Studio: http://localhost:3000/dashboard/database
echo  - Press Ctrl+C anytime to stop.
echo.

:: 3. Ultra-fast Turbopack dev server (~1.5s boot time)
node node_modules\next\dist\bin\next dev --turbo -H 0.0.0.0 -p 3000

if %errorlevel% neq 0 (
    echo.
    echo [Inkloom] Turbopack fallback to standard dev...
    node node_modules\next\dist\bin\next dev -H 0.0.0.0 -p 3000
    if %errorlevel% neq 0 pause
)
