const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const path = require('path');
const os = require('os');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Initialize express
const app = express();

// Enable CORS
app.use(cors());

// Connect to database
connectDB();

// Body parser - Increase limit for photo uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Route files
const students = require('./routes/students');
const fees = require('./routes/fees');
const auth = require('./routes/auth');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/students', students);
app.use('/api/v1/fees', fees);
app.use('/api/v1/auth', auth);

// Network info endpoint
app.get('/api/network-info', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  let networkIp = null;
  let allIPs = [];
  
  // Find all non-internal IPv4 addresses
  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        allIPs.push({
          interface: interfaceName,
          address: address.address
        });
        
        // Prefer WiFi or Ethernet interfaces
        if (!networkIp || interfaceName.toLowerCase().includes('wi-fi') || 
            interfaceName.toLowerCase().includes('ethernet') ||
            interfaceName.toLowerCase().includes('wlan') ||
            interfaceName.toLowerCase().includes('eth')) {
          networkIp = address.address;
        }
      }
    }
  }
  
  // If no preferred interface found, use the first available
  if (!networkIp && allIPs.length > 0) {
    networkIp = allIPs[0].address;
  }
  
  console.log(`Network IP detected: ${networkIp}`.cyan);
  console.log(`All available IPs:`, allIPs);
  
  res.json({
    networkIp,
    allIPs,
    hostname: os.hostname(),
    platform: os.platform(),
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (should be after the routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = app.listen(
  PORT,
  HOST,
  console.log(`Server running in ${process.env.NODE_ENV} mode on http://${HOST}:${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
