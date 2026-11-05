@echo off
title Inkloom AI - Port 5000 Server

echo =====================================================================
echo        INKLOOM AI - RUNNING ON ALTERNATIVE PORT 5000
echo =====================================================================
echo.

:: 1. Clear Port 5000
node -e "try{const out=require('child_process').execSync('netstat -ano').toString();for(const l of out.split('\n')){if(l.includes(':5000')&&l.includes('LISTENING')){const pid=l.trim().split(/\s+/).pop();if(pid&&pid!=='0'){try{require('child_process').execSync('taskkill /F /PID '+pid);}catch(e){}}}}}catch(e){}" >nul 2>&1

:: 2. Ensure build exists
if not exist ".next\BUILD_ID" (
    echo [1/2] Compiling build...
    call node node_modules\next\dist\bin\next build
)

:: 3. Launch browser
start "" cmd /c "timeout /t 1 /nobreak >nul && start http://127.0.0.1:5000"

echo [2/2] Server running on Port 5000:
echo  - URL: http://127.0.0.1:5000
echo  - Press Ctrl+C to terminate.
echo.

node node_modules\next\dist\bin\next start -p 5000 -H 0.0.0.0
