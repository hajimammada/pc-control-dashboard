@echo off
title PC Control Agent
cd /d "%~dp0\agent"
node server.js
pause
