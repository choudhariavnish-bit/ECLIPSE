@echo off
title ECLIPSE - Enterprise Brand Governance Platform
cd /d "%~dp0"

:: Suppress Vite native config warning
set VITE_CONFIG_NATIVE_IGNORE_WARNING=true

node scripts\prelaunch.js

if exist "node_modules\vite\bin\vite.js" (
  node node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3000 --open
) else (
  node server.js
)

if errorlevel 1 (
    echo.
    echo [ECLIPSE] Server exited.
    pause
)
