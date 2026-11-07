@echo off
title ECLIPSE - Brand Governance Server
cd /d "%~dp0"

set VITE_CONFIG_NATIVE_IGNORE_WARNING=true

node scripts\prelaunch.js

if exist "node_modules\vite\bin\vite.js" (
  node node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3000
) else (
  node server.js
)

if errorlevel 1 (
    echo.
    echo =====================================================================
    echo [ECLIPSE] Server exited with code %errorlevel%.
    echo =====================================================================
    pause
)
