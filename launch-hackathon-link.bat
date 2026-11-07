@echo off
title ECLIPSE - Hackathon Direct Cloudflare Tunnel
cd /d "%~dp0"
echo ===============================================================
echo     ECLIPSE - LAUNCHING ZERO-PASSWORD PUBLIC HACKATHON LINK
echo ===============================================================
echo.
cloudflared.exe tunnel --url http://127.0.0.1:3000
pause

