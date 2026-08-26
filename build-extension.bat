@echo off
title Build Nexus Chrome Extension
cd /d "%~dp0"
echo ========================================================
echo Building Nexus Dashboard Chrome Extension...
echo ========================================================
cd client
call npm run build
cd ..
node generate-icons.cjs
echo ========================================================
echo Extension built successfully in ./extension
echo You can now load ./extension into chrome://extensions !
echo ========================================================
pause
