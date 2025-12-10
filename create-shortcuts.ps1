# PowerShell script to create AL-Fees desktop shortcut
Write-Host "Creating AL-Fees Desktop Shortcut..." -ForegroundColor Green

$WshShell = New-Object -comObject WScript.Shell

# Desktop shortcuts - Multiple options
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')

# Regular shortcut with command prompts
$Shortcut1 = $WshShell.CreateShortcut("$DesktopPath\AL-Fees (Normal).lnk")
$Shortcut1.TargetPath = "D:\AL-Fees\start-al-fees.bat"
$Shortcut1.WorkingDirectory = "D:\AL-Fees"
$Shortcut1.Description = "AL-Fees School Management System (Shows command prompts)"
$Shortcut1.WindowStyle = 1
$Shortcut1.Save()

# Silent shortcut without command prompts
$Shortcut2 = $WshShell.CreateShortcut("$DesktopPath\AL-Fees (Silent).lnk")
$Shortcut2.TargetPath = "D:\AL-Fees\start-al-fees-invisible.vbs"
$Shortcut2.WorkingDirectory = "D:\AL-Fees"
$Shortcut2.Description = "AL-Fees School Management System (No command prompts)"
$Shortcut2.WindowStyle = 1
$Shortcut2.Save()

# Stop shortcut
$Shortcut3 = $WshShell.CreateShortcut("$DesktopPath\Stop AL-Fees.lnk")
$Shortcut3.TargetPath = "D:\AL-Fees\stop-al-fees.bat"
$Shortcut3.WorkingDirectory = "D:\AL-Fees"
$Shortcut3.Description = "Stop AL-Fees School Management System"
$Shortcut3.WindowStyle = 1
$Shortcut3.Save()

Write-Host "Desktop shortcuts created successfully!" -ForegroundColor Green

# Start Menu shortcuts
$StartMenuPath = [System.Environment]::GetFolderPath('StartMenu') + "\Programs"
if (!(Test-Path "$StartMenuPath\AL-Fees")) {
    New-Item -ItemType Directory -Path "$StartMenuPath\AL-Fees" -Force
}

# Start Menu shortcuts
$StartMenuShortcut1 = $WshShell.CreateShortcut("$StartMenuPath\AL-Fees\AL-Fees (Normal).lnk")
$StartMenuShortcut1.TargetPath = "D:\AL-Fees\start-al-fees.bat"
$StartMenuShortcut1.WorkingDirectory = "D:\AL-Fees"
$StartMenuShortcut1.Description = "AL-Fees School Management System (Shows command prompts)"
$StartMenuShortcut1.WindowStyle = 1
$StartMenuShortcut1.Save()

$StartMenuShortcut2 = $WshShell.CreateShortcut("$StartMenuPath\AL-Fees\AL-Fees (Silent).lnk")
$StartMenuShortcut2.TargetPath = "D:\AL-Fees\start-al-fees-invisible.vbs"
$StartMenuShortcut2.WorkingDirectory = "D:\AL-Fees"
$StartMenuShortcut2.Description = "AL-Fees School Management System (No command prompts)"
$StartMenuShortcut2.WindowStyle = 1
$StartMenuShortcut2.Save()

$StartMenuShortcut3 = $WshShell.CreateShortcut("$StartMenuPath\AL-Fees\Stop AL-Fees.lnk")
$StartMenuShortcut3.TargetPath = "D:\AL-Fees\stop-al-fees.bat"
$StartMenuShortcut3.WorkingDirectory = "D:\AL-Fees"
$StartMenuShortcut3.Description = "Stop AL-Fees School Management System"
$StartMenuShortcut3.WindowStyle = 1
$StartMenuShortcut3.Save()

Write-Host "Start Menu shortcuts created successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "Created shortcuts:" -ForegroundColor Yellow
Write-Host "📁 Desktop:" -ForegroundColor Cyan
Write-Host "   • AL-Fees (Normal) - Shows command prompts" -ForegroundColor White
Write-Host "   • AL-Fees (Silent) - No command prompts (RECOMMENDED)" -ForegroundColor Green
Write-Host "   • Stop AL-Fees - Stops all servers" -ForegroundColor Red
Write-Host ""
Write-Host "📱 Start Menu (AL-Fees folder):" -ForegroundColor Cyan
Write-Host "   • Same shortcuts as desktop" -ForegroundColor White
Write-Host ""
Write-Host "Instructions to pin to taskbar:" -ForegroundColor Yellow
Write-Host "1. Right-click on 'AL-Fees (Silent)' desktop shortcut" -ForegroundColor White
Write-Host "2. Select 'Pin to taskbar' from the context menu" -ForegroundColor White
Write-Host "3. The shortcut will appear in your taskbar for easy access" -ForegroundColor White
Write-Host ""
Write-Host "Recommended usage:" -ForegroundColor Yellow
Write-Host "• Use 'AL-Fees (Silent)' for daily use - no command prompts!" -ForegroundColor Green
Write-Host "• Use 'Stop AL-Fees' when you're done" -ForegroundColor White
Write-Host "• Use 'AL-Fees (Normal)' only for troubleshooting" -ForegroundColor White

Write-Host ""
Write-Host "Setup complete! 🎉" -ForegroundColor Green

Read-Host "Press Enter to continue..."