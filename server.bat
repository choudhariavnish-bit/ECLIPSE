@echo off
title Inkloom AI - Production Server
cd /d "%~dp0"

node scripts\prelaunch.js
if errorlevel 1 (
    echo [Inkloom] Initialization failed.
    pause
    exit /b 1
)

if not exist ".next\BUILD_ID" (
    echo [Inkloom] Compiling production bundle...
    if exist ".next" rd /s /q .next
    node node_modules\next\dist\bin\next build
    if errorlevel 1 (
        echo [Inkloom] Build failed.
        pause
        exit /b 1
    )
)

start "Inkloom Browser Waiter" /min node scripts\open-browser.js http://localhost:3000

node node_modules\next\dist\bin\next start -p 3000

if errorlevel 1 (
    echo.
    echo =====================================================================
    echo [Inkloom] Server exited with code %errorlevel%.
    echo =====================================================================
    pause
)
