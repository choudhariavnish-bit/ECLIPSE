@echo off
title Inkloom AI - Enterprise Brand Governance Platform
cd /d "%~dp0"

node scripts\prelaunch.js
if errorlevel 1 (
    echo [Inkloom] Initialization failed.
    pause
    exit /b 1
)

:: Run Next.js server on 0.0.0.0:3000
node node_modules\next\dist\bin\next dev -p 3000 -H 0.0.0.0

if errorlevel 1 (
    echo.
    echo [Inkloom] Server exited with an error.
    pause
)
