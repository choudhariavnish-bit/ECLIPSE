@echo off
setlocal enabledelayedexpansion
title Inkloom AI - High Performance Platform

echo =====================================================================
echo           INKLOOM AI - HIGH PERFORMANCE BRAND PLATFORM
echo =====================================================================
echo.

:: 1. Clear any stuck process holding port 3000
echo [1/3] Clearing port 3000...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%p >nul 2>&1
)

:: 2. Find local IPv4 address
set LOCAL_IP=localhost
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set CURRENT_IP=%%a
    set CURRENT_IP=!CURRENT_IP: =!
    if not "!CURRENT_IP!"=="127.0.0.1" set LOCAL_IP=!CURRENT_IP!
)

echo [2/3] Network endpoints configured:
echo       - Local Machine:    http://localhost:3000
echo       - Any Wi-Fi Device: http://!LOCAL_IP!:3000
echo.

:: 3. Launch browser in background the millisecond server answers
echo [3/3] Starting server with Turbopack...
start /b powershell -NoProfile -Command "for ($i=0; $i -lt 35; $i++) { Start-Sleep -Milliseconds 800; try { $r = [System.Net.WebRequest]::Create('http://localhost:3000'); $resp = $r.GetResponse(); if ($resp.StatusCode -eq 200) { Start-Process 'http://localhost:3000'; break; } } catch {} }"

:: 4. Start public tunnel for external devices
start "Inkloom Public Tunnel" cmd /c "powershell -NoProfile -Command \"for ($i=0; $i -lt 35; $i++) { Start-Sleep -Milliseconds 900; try { $r = [System.Net.WebRequest]::Create('http://localhost:3000'); $resp = $r.GetResponse(); if ($resp.StatusCode -eq 200) { break; } } catch {} }; Write-Host 'Generating live public URL for remote access...'; npx lt --port 3000\""

echo.
echo =====================================================================
echo  SERVER LIVE (Opening browser automatically)
echo  Local URL:   http://localhost:3000
echo  Network URL: http://!LOCAL_IP!:3000
echo =====================================================================
echo.

call npx next dev -H 0.0.0.0 -p 3000 --turbopack
