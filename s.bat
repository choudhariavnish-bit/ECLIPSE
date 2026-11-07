@echo off
title Inkloom AI - React Platform
cd /d "%~dp0"

node server.js

if errorlevel 1 (
    echo.
    echo =====================================================================
    echo [Inkloom] Server exited with code %errorlevel%.
    echo =====================================================================
    pause
)
