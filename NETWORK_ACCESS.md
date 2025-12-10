# Network Access Guide for AL-Fees System

## Your Network IP Address
**Local IP:** `10.200.121.78`

## How to Start the Application

### 1. Start Backend Server
Open a terminal and run:
```powershell
cd D:\AL-Fees\backend
node server.js
```

**Backend will be accessible at:**
- Local: `http://localhost:5000`
- Network: `http://10.200.121.78:5000`

### 2. Start Frontend Server
Open another terminal and run:
```powershell
cd D:\AL-Fees\frontend
npm run dev
```

**Frontend will be accessible at:**
- Local: `http://localhost:3000`
- Network: `http://10.200.121.78:3000`

## Access from Other Devices

### On the Same WiFi/Network:
Any device (phone, tablet, another computer) connected to the same network can access:

- **Main Application:** `http://10.200.121.78:3000`
- **API Endpoint:** `http://10.200.121.78:5000/api/v1`

### Important Notes:
1. **Firewall:** Make sure Windows Firewall allows connections on ports 3000 and 5000
2. **Same Network:** All devices must be on the same WiFi/LAN network
3. **Keep Servers Running:** Both terminal windows must stay open while using the app

## Firewall Configuration (If Needed)

If you can't access from other devices, run these commands in PowerShell as Administrator:

```powershell
# Allow port 3000 (Frontend)
New-NetFirewallRule -DisplayName "AL-Fees Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Allow port 5000 (Backend)
New-NetFirewallRule -DisplayName "AL-Fees Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

## Testing Network Access

### From This Computer:
- Frontend: Open browser → `http://localhost:3000`
- Backend: Open browser → `http://localhost:5000/api/v1/students`

### From Mobile/Other Device:
1. Connect to the same WiFi
2. Open browser → `http://10.200.121.78:3000`
3. You should see the AL-Fees login page

## Troubleshooting

### Can't access from other devices?
1. Check both servers are running (look at terminal windows)
2. Verify firewall rules are added
3. Make sure other device is on same WiFi network
4. Try disabling Windows Firewall temporarily to test

### Frontend can't connect to backend?
- Check that backend URL in frontend/src/services/api.js is correct
- Backend should be running on port 5000

## Quick Start Script

Save this as `start-servers.ps1`:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\AL-Fees\backend; node server.js"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\AL-Fees\frontend; npm run dev"

Write-Host "
Servers starting...
Frontend: http://10.200.121.78:3000
Backend: http://10.200.121.78:5000
" -ForegroundColor Green
```

Then run: `.\start-servers.ps1`
