@echo off
title ECLIPSE - Enterprise Brand Governance Platform (React + Vite)
cd /d "%~dp0"

:: Suppress Vite native config warning
set VITE_CONFIG_NATIVE_IGNORE_WARNING=true

set NODE_EXE=node
where node >nul 2>nul
if %errorlevel% neq 0 (
  if exist "C:\Users\Pratik\Downloads\node-v24.21.0-win-x64\node-v24.21.0-win-x64\node.exe" (
    set NODE_EXE="C:\Users\Pratik\Downloads\node-v24.21.0-win-x64\node-v24.21.0-win-x64\node.exe"
  )
)

%NODE_EXE% scripts\prelaunch.js
if errorlevel 1 (
    echo [ECLIPSE] Initialization failed.
    pause
    exit /b 1
)

:: Start Cloudflare Zero-Password Public Tunnel in background if present
if exist "cloudflared.exe" (
  start /B cloudflared.exe tunnel --url http://127.0.0.1:3000 > tunnel.log 2>&1
)

:: Run high-speed pure React + Vite server on 0.0.0.0:3000 and auto-open browser
%NODE_EXE% node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3000 --open

if errorlevel 1 (
    echo.
    echo [ECLIPSE] Vite server exited with an error.
    pause
)
