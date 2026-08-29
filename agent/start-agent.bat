@echo off
title PC Control Agent
cd /d "%~dp0"
echo ========================================================
echo Starting PC Control Agent...
echo ========================================================
node server.js
pause
