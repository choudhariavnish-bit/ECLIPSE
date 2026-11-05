@echo off
title Inkloom AI Server

echo =====================================================================
echo        INKLOOM AI - HIGH-SPEED GOVERNANCE SERVER
echo =====================================================================
echo.

echo [1/3] Clearing port 3000...
node -e "try{const out=require('child_process').execSync('netstat -ano').toString();for(const l of out.split('\n')){if(l.includes(':3000')&&l.includes('LISTENING')){const pid=l.trim().split(/\s+/).pop();if(pid&&pid!=='0'){try{require('child_process').execSync('taskkill /F /PID '+pid);}catch(e){}}}}}catch(e){}" >nul 2>&1

if not exist ".next\BUILD_ID" (
    echo [2/3] Preparing production build...
    call node node_modules\next\dist\bin\next build
) else (
    echo [2/3] Verified production build...
)

echo [3/3] Opening browser and starting server...
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

echo.
echo =====================================================================
echo  SERVER RUNNING
echo  Local URL:        http://localhost:3000
echo  Database Studio:  http://localhost:3000/dashboard/database
echo  Press Ctrl+C to terminate.
echo =====================================================================
echo.

node node_modules\next\dist\bin\next start -p 3000 -H 0.0.0.0

if %errorlevel% neq 0 (
    echo.
    echo [Inkloom] Switching to Turbopack engine...
    node node_modules\next\dist\bin\next dev --turbo -H 0.0.0.0 -p 3000
    if %errorlevel% neq 0 pause
)
