Set objShell = CreateObject("WScript.Shell")

' Kill any existing node processes
objShell.Run "taskkill /f /im node.exe", 0, False

' Wait 2 seconds
WScript.Sleep 2000

' Start Backend Server (Hidden)
objShell.Run "cmd /c ""cd /d D:\AL-Fees\backend && node server.js""", 0, False

' Wait 3 seconds for backend to start
WScript.Sleep 3000

' Start Frontend Server (Hidden)
objShell.Run "cmd /c ""cd /d D:\AL-Fees\frontend && npm run dev""", 0, False

' Wait 8 seconds for frontend to start
WScript.Sleep 8000

' Open browser
objShell.Run "http://localhost:3001", 1, False

' Show completion message
MsgBox "AL-Fees is now running silently in the background!" & vbCrLf & vbCrLf & _
       "Access URLs:" & vbCrLf & _
       "  Local: http://localhost:3001" & vbCrLf & _
       "  Network: Shown in blue bar at top of page" & vbCrLf & vbCrLf & _
       "Servers are running in hidden windows." & vbCrLf & _
       "To stop: Run 'taskkill /f /im node.exe' in Command Prompt", _
       vbInformation + vbOKOnly, "AL-Fees Started Successfully"