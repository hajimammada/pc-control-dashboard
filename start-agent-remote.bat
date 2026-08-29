@echo off
title PC Control Remote Agent (Public Tunnel)
cd /d "%~dp0\agent"
node tunnel.js
pause
