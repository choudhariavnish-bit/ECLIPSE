@echo off
title ECLIPSE Platform Launcher
echo ============================================================
echo   ECLIPSE - Multimodal Brand Governance Platform
echo ============================================================
echo.

set BASE_DIR=%~dp0

echo [1/2] Starting ECLIPSE Backend Engine (FastAPI) on Port 8000...
start "ECLIPSE Engine (Port 8000)" cmd /k "cd /d %BASE_DIR% && python run_eclipse.py"

echo [2/2] Starting ECLIPSE Frontend on Port 3000...
if exist "%BASE_DIR%node_modules\vite\bin\vite.js" (
  start "ECLIPSE Frontend (Port 3000)" cmd /k "cd /d %BASE_DIR% && node node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3000"
) else (
  start "ECLIPSE Frontend (Port 3000)" cmd /k "cd /d %BASE_DIR% && node server.js"
)

echo.
echo ============================================================
echo   ECLIPSE PLATFORM IS RUNNING!
echo   Frontend Studio:  http://localhost:3000
echo   AI Engine Health: http://localhost:8000/api/v1/health
echo   API Docs:         http://localhost:8000/docs
echo ============================================================
echo.
