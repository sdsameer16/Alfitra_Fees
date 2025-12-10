# PowerShell script to start AL-Fees silently
Write-Host "Starting AL-Fees School Management System (Silent Mode)..." -ForegroundColor Green

# Kill any existing node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend Server (Hidden)
Write-Host "[1/2] Starting Backend Server (Hidden)..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "D:\AL-Fees\backend" -WindowStyle Hidden -PassThru

# Wait for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server (Hidden) 
Write-Host "[2/2] Starting Frontend Server (Hidden)..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory "D:\AL-Fees\frontend" -WindowStyle Hidden -PassThru

# Wait for frontend to start
Start-Sleep -Seconds 8

# Open browser
Write-Host "Opening AL-Fees in your browser..." -ForegroundColor Green
Start-Process "http://localhost:3001"

Write-Host ""
Write-Host "AL-Fees is now running silently!" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "  Local: http://localhost:3001" -ForegroundColor White
Write-Host "  Network: Will be shown in the blue bar at top of the page" -ForegroundColor White
Write-Host ""
Write-Host "Process Information:" -ForegroundColor Yellow
Write-Host "  Backend PID: $($backendProcess.Id)" -ForegroundColor White
Write-Host "  Frontend PID: $($frontendProcess.Id)" -ForegroundColor White
Write-Host ""
Write-Host "To stop the servers, run: Get-Process -Name 'node' | Stop-Process -Force" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to close this window..." -ForegroundColor Gray
Read-Host