@echo off
title ECLIPSE AI - React Platform Server
cd /d "%~dp0"

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

:: Run Vite server on 0.0.0.0:3000
%NODE_EXE% node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3000

if errorlevel 1 (
    echo.
    echo =====================================================================
    echo [ECLIPSE] Server exited with code %errorlevel%.
    echo =====================================================================
    pause
)
