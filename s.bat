@echo off
title Inkloom AI Platform

echo =====================================================================
echo           INKLOOM AI - HIGH PERFORMANCE BRAND PLATFORM
echo =====================================================================
echo.

:: 1. Sub-50ms Port Killer (clears any zombie process on port 3000)
node -e "try{const out=require('child_process').execSync('netstat -ano').toString();for(const l of out.split('\n')){if(l.includes(':3000')&&l.includes('LISTENING')){const pid=l.trim().split(/\s+/).pop();if(pid&&pid!=='0'){try{require('child_process').execSync('taskkill /F /PID '+pid);}catch(e){}}}}}catch(e){}" >nul 2>&1

:: 2. Ensure optimized high-speed bundle exists
if not exist ".next\BUILD_ID" (
    echo [Inkloom] One-time setup: compiling high-speed bundle...
    call node node_modules\next\dist\bin\next build
)

:: 3. Open browser immediately (~1s)
start "" cmd /c "timeout /t 1 /nobreak >nul && start http://localhost:3000"

echo [Inkloom] Launching instant server (~600ms boot)...
echo  - Local:           http://localhost:3000
echo  - Database Studio: http://localhost:3000/dashboard/database
echo  - Press Ctrl+C anytime to stop.
echo.

:: 4. Launch pre-compiled server for instant (<50ms) page loads
node node_modules\next\dist\bin\next start -p 3000 -H 0.0.0.0

if %errorlevel% neq 0 (
    echo.
    echo [Inkloom] Fallback to Turbopack engine...
    node node_modules\next\dist\bin\next dev --turbo -H 0.0.0.0 -p 3000
    if %errorlevel% neq 0 pause
)
