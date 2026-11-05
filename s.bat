@echo off
setlocal enabledelayedexpansion
title Inkloom AI - High Speed Platform

echo =====================================================================
echo           INKLOOM AI - ENTERPRISE GOVERNANCE PLATFORM
echo =====================================================================
echo.

:: 1. Clear any stuck process holding port 3000
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%p >nul 2>&1

:: 2. Find local Wi-Fi IP address
set LOCAL_IP=localhost
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set CURRENT_IP=%%a
    set CURRENT_IP=!CURRENT_IP: =!
    if not "!CURRENT_IP!"=="127.0.0.1" set LOCAL_IP=!CURRENT_IP!
)

:: 3. Build if needed
if not exist ".next\BUILD_ID" call npx next build

:: 4. Background browser launcher
start /b powershell -NoProfile -Command "for ($i=0; $i -lt 30; $i++) { Start-Sleep -Milliseconds 400; try { $r = [System.Net.WebRequest]::Create('http://localhost:3000'); $resp = $r.GetResponse(); if ($resp.StatusCode -eq 200) { Start-Process 'http://localhost:3000'; break; } } catch {} }"

:: 5. Background public tunnel for external devices
start "Inkloom Public Tunnel" cmd /c "powershell -NoProfile -Command \"for ($i=0; $i -lt 30; $i++) { Start-Sleep -Milliseconds 600; try { $r = [System.Net.WebRequest]::Create('http://localhost:3000'); $resp = $r.GetResponse(); if ($resp.StatusCode -eq 200) { break; } } catch {} }; Write-Host 'Generating live public URL...'; npx lt --port 3000\""

echo =====================================================================
echo  SERVER LIVE IN UNDER 2 SECONDS
echo.
echo  Access Endpoints:
echo  - Local Machine:    http://localhost:3000
echo  - Any Wi-Fi Device: http://!LOCAL_IP!:3000
echo  - Database Studio:  http://localhost:3000/dashboard/database
echo =====================================================================
echo.
echo Press Ctrl+C anytime to stop.
echo.

:: 6. Launch pre-compiled production server
node node_modules\next\dist\bin\next start -p 3000 -H 0.0.0.0
