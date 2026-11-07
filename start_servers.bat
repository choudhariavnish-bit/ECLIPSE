@echo off
title ECLIPSE AI Platform Launcher
echo ============================================================
echo   ECLIPSE AI - Multimodal Brand Governance Platform
echo ============================================================
echo.

set BASE_DIR=%~dp0
set NODE_EXE=node

echo [1/2] Starting ECLIPSE AI Engine (FastAPI) on Port 8000...
start "ECLIPSE AI Engine (Port 8000)" cmd /k "cd /d %BASE_DIR% && python run_eclipse.py"

echo [2/2] Starting ECLIPSE Native Platform on Port 3000...
start "ECLIPSE Platform (Port 3000)" cmd /k "cd /d %BASE_DIR% && %NODE_EXE% server.js"

echo.
echo ============================================================
echo   ECLIPSE PLATFORM IS RUNNING!
echo   Frontend Studio:  http://localhost:3000
echo   AI Engine Health: http://localhost:8000/api/v1/health
echo   API Docs:         http://localhost:8000/docs
echo ============================================================
echo.
