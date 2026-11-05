@echo off
title Inkloom AI Platform

echo =====================================================================
echo           INKLOOM AI - HIGH PERFORMANCE BRAND PLATFORM
echo =====================================================================
echo.

:: 1. Ultra-fast port check & release (sub-50ms)
node -e "try{const out=require('child_process').execSync('netstat -ano').toString();for(const l of out.split('\n')){if(l.includes(':3000')&&l.includes('LISTENING')){const pid=l.trim().split(/\s+/).pop();if(pid&&pid!=='0'){try{require('child_process').execSync('taskkill /F /PID '+pid);}catch(e){}}}}}catch(e){}" >nul 2>&1

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
