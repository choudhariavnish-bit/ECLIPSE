@echo off
title ECLIPSE - Intelligent Brand Governance
cd /d "%~dp0"

echo [ECLIPSE] Starting Python FastAPI AI & Copilot Engine (Port 8000)...
start /b cmd /c "cd ai-engine && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo [ECLIPSE] Launching Web Console (Port 3000)...
node scripts\prelaunch.js
node scripts\run-server.js
pause

