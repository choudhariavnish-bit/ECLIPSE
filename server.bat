@echo off
title Inkloom AI - Production Server

echo =====================================================================
echo        INKLOOM AI - PRODUCTION HIGH-SPEED SERVER
echo =====================================================================
echo.

echo [1/2] Checking port 3000...
node -e "const { execSync } = require('child_process'); try { const out = execSync('netstat -ano').toString(); for (const line of out.split('\n')) { if (line.includes(':3000') && line.includes('LISTENING')) { const pid = line.trim().split(/\s+/).pop(); if (pid && pid !== '0') execSync('taskkill /F /PID ' + pid); } } } catch(e){}" >nul 2>&1

echo [2/2] Opening browser and starting production server...
start http://localhost:3000 >nul 2>&1

echo.
echo =====================================================================
echo  PRODUCTION SERVER RUNNING
echo  Local URL:        http://localhost:3000
echo  Database Studio:  http://localhost:3000/dashboard/database
echo  Press Ctrl+C to terminate.
echo =====================================================================
echo.

node node_modules\next\dist\bin\next start -p 3000 -H 0.0.0.0

if %errorlevel% neq 0 (
    echo.
    echo Production server stopped with code %errorlevel%.
    pause
)
