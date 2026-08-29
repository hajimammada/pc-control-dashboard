@echo off
title PC Control Remote Agent (Control from Anywhere)
cd /d "%~dp0"
echo ========================================================
echo Launching PC Control Agent with Cloudflare Remote Tunnel...
echo ========================================================
node tunnel.js
pause
