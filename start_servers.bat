@echo off
title ECLIPSE AI Platform Launcher
echo ============================================================
echo   ECLIPSE AI — Multimodal Brand Governance Platform
echo ============================================================
echo.

set BASE_DIR=%~dp0

echo [1/2] Starting ECLIPSE AI Engine (FastAPI) on Port 8000...
start "ECLIPSE AI Engine (Port 8000)" cmd /k "cd /d %BASE_DIR% && python run_eclipse.py"

echo [2/2] Starting ECLIPSE Frontend (React + Vite) on Port 3000...
start "ECLIPSE Frontend (Port 3000)" cmd /k "cd /d %BASE_DIR% && node node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3000"

echo.
echo ============================================================
echo   ECLIPSE PLATFORM IS RUNNING!
echo   Frontend Studio:  http://localhost:3000
echo   AI Engine Health: http://localhost:8000/api/v1/health
echo   API Docs:         http://localhost:8000/docs
echo ============================================================
echo.
