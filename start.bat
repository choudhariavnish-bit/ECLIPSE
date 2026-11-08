@echo off
title ECLIPSE - Intelligent Brand Governance
cd /d "%~dp0"
node scripts\prelaunch.js
node scripts\run-server.js
pause

