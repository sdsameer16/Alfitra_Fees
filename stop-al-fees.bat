@echo off
title AL-Fees Shutdown
echo Stopping AL-Fees School Management System...
echo.

REM Kill all node processes (this stops both backend and frontend)
echo Stopping Backend and Frontend servers...
taskkill /f /im node.exe >nul 2>&1

REM Also kill any npm processes
taskkill /f /im npm.exe >nul 2>&1

echo.
echo AL-Fees has been stopped successfully!
echo All server processes have been terminated.
echo.
pause