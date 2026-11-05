@echo off
title Inkloom AI - Public Live Tunnel

echo =====================================================================
echo       INKLOOM AI - PUBLIC LIVE WEB TUNNEL (NO LOCALHOST)
echo =====================================================================
echo.

:: 1. Clear Port 3000
node -e "try{const out=require('child_process').execSync('netstat -ano').toString();for(const l of out.split('\n')){if(l.includes(':3000')&&l.includes('LISTENING')){const pid=l.trim().split(/\s+/).pop();if(pid&&pid!=='0'){try{require('child_process').execSync('taskkill /F /PID '+pid);}catch(e){}}}}}catch(e){}" >nul 2>&1

:: 2. Ensure high-speed production build exists
if not exist ".next\BUILD_ID" (
    echo [1/3] Compiling high-speed bundle...
    call node node_modules\next\dist\bin\next build
)

echo [2/3] Starting internal high-speed server...
start /b node node_modules\next\dist\bin\next start -p 3000 -H 0.0.0.0 >nul 2>&1

:: Wait 1.5s for server boot
node -e "setTimeout(()=>{}, 1500);"

echo [3/3] Generating public HTTPS cloud tunnel...
echo.
echo =====================================================================
echo  LIVE PUBLIC URL READY - SHARE WITH ANYONE / USE ON ANY DEVICE
echo  (Your browser will open automatically with the public HTTPS link)
echo  Press Ctrl+C to stop the public tunnel.
echo =====================================================================
echo.

node node_modules\localtunnel\bin\lt.js --port 3000 -o

if %errorlevel% neq 0 (
    echo.
    echo Tunnel stopped.
    pause
)
