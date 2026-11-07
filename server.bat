@echo off
title Inkloom AI - React Platform Server
cd /d "%~dp0"

node scripts\prelaunch.js
if errorlevel 1 (
    echo [Inkloom] Initialization failed.
    pause
    exit /b 1
)

:: Run Vite server on 0.0.0.0:3000
node node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3000

if errorlevel 1 (
    echo.
    echo =====================================================================
    echo [Inkloom] Server exited with code %errorlevel%.
    echo =====================================================================
    pause
)
