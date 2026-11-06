@echo off
title Inkloom AI - Enterprise Brand Governance Platform
cd /d "%~dp0"

node scripts\prelaunch.js
if errorlevel 1 (
    echo [Inkloom] Initialization failed.
    pause
    exit /b 1
)

start "Inkloom Browser Waiter" /min node scripts\open-browser.js http://localhost:3000

node node_modules\next\dist\bin\next dev -p 3000

if errorlevel 1 (
    echo.
    echo =====================================================================
    echo [Inkloom] Server exited with code %errorlevel%.
    echo =====================================================================
    pause
)
