@echo off
title Inkloom AI - Enterprise Brand Governance Platform
cd /d "%~dp0"

node scripts\prelaunch.js
if errorlevel 1 (
    echo [Inkloom] Initialization failed.
    pause
    exit /b 1
)

:: Launch browser after 4 seconds (once Next.js finishes compiling)
start "" /b cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

node node_modules\next\dist\bin\next dev -p 3000

if errorlevel 1 (
    echo.
    echo =====================================================================
    echo [Inkloom] Server exited with code %errorlevel%.
    echo =====================================================================
    pause
)
