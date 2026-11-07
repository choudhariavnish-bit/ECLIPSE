@echo off
title Inkloom AI - Enterprise Brand Governance Platform (React + Vite)
cd /d "%~dp0"

:: Suppress Vite native config warning
set VITE_CONFIG_NATIVE_IGNORE_WARNING=true

node scripts\prelaunch.js
if errorlevel 1 (
    echo [Inkloom] Initialization failed.
    pause
    exit /b 1
)

:: Run high-speed pure React + Vite server on 0.0.0.0:3000 and auto-open browser
node node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3000 --open

if errorlevel 1 (
    echo.
    echo [Inkloom] Vite server exited with an error.
    pause
)
