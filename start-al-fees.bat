@echo off
title AL-Fees School Management System
echo Starting AL-Fees School Management System...
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server...
cd /d "D:\AL-Fees\backend"
start "AL-Fees Backend" cmd /k "node server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo [2/2] Starting Frontend Server...
cd /d "D:\AL-Fees\frontend"
start "AL-Fees Frontend" cmd /k "npm run dev"

REM Wait for frontend to start and then open browser
timeout /t 8 /nobreak >nul
echo.
echo Opening AL-Fees in your browser...
start "" "http://localhost:3001"

echo.
echo AL-Fees is now running!
echo Local Access:
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3001
echo.
echo Mobile/Network Access:
echo   The application will show network URLs at the top of the page
echo   Look for the blue "Network Access Available" bar with copy button
echo   Share the network URL with mobile devices on the same WiFi
echo.
echo Features enabled:
echo   - Mobile responsive design with hamburger menu
echo   - Network URL display with copy functionality  
echo   - Touch-friendly interface for tablets and phones
echo.
echo Keep both server windows open while using the application.
echo Close this window when you're done.
pause