@echo off
REM Silent startup script for AL-Fees
cd /d "D:\AL-Fees\backend"
start /min "" cmd /c "node server.js"

timeout /t 3 /nobreak >nul

cd /d "D:\AL-Fees\frontend"
start /min "" cmd /c "npm run dev"

timeout /t 8 /nobreak >nul
start "" "http://localhost:3001"