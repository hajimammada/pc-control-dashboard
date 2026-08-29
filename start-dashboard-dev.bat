@echo off
title PC Control Dashboard - Dev Mode
cd /d "%~dp0"

echo ========================================================
echo Starting PC Control Companion Agent...
echo ========================================================
start "PC Control Agent" cmd /c "cd agent && node server.js"

echo ========================================================
echo Starting PC Control Dashboard Web Client...
echo ========================================================
cd client
npm run dev
pause
