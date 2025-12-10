@echo off
title AL-Fees Startup
echo Starting AL-Fees School Management System (Hidden Mode)...
echo.

REM Kill any existing node processes
taskkill /f /im node.exe >nul 2>&1

REM Start Backend Server (Hidden)
echo [1/2] Starting Backend Server (Hidden)...
cd /d "D:\AL-Fees\backend"
start /min "" cmd /c "node server.js"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend Server (Hidden)
echo [2/2] Starting Frontend Server (Hidden)...
cd /d "D:\AL-Fees\frontend"
start /min "" cmd /c "npm run dev"

REM Wait for frontend to start and then open browser
timeout /t 8 /nobreak >nul
echo.
echo Opening AL-Fees in your browser...
start "" "http://localhost:3001"

echo.
echo AL-Fees is now running silently in the background!
echo.
echo Access URLs:
echo   Local: http://localhost:3001
echo   Network: Will be shown in the blue bar at top of the page
echo.
echo The servers are running in hidden windows.
echo Close this window when you're done using the application.
echo.
echo Press any key to minimize this window...
pause >nul

REM Minimize this window
powershell -command "(New-Object -comObject Shell.Application).MinimizeAll()"