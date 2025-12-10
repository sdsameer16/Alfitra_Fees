import React, { useState, useEffect, useRef } from 'react';
import QRCodeGenerator from 'qrcode';
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  IconButton,
  Typography,
  Snackbar,
  useTheme,
  useMediaQuery,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  ContentCopy,
  Wifi,
  ExpandMore,
  ExpandLess,
  NetworkWifi,
  QrCode
} from '@mui/icons-material';

const NetworkInfo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [networkUrl, setNetworkUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [expanded, setExpanded] = useState(!isMobile);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        const protocol = window.location.protocol;
        const port = window.location.port || '3000';
        
        // Try to fetch network IP from backend
        const response = await fetch('http://localhost:5000/api/network-info');
        const data = await response.json();
        
        if (data.networkIp && data.networkIp !== '127.0.0.1') {
          setNetworkUrl(`${protocol}//${data.networkIp}:${port}`);
        } else {
          // If backend doesn't have network IP, try to detect it
          const currentHost = window.location.hostname;
          if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
            setNetworkUrl(`${protocol}//${currentHost}:${port}`);
          } else {
            // Show a placeholder with instructions
            setNetworkUrl('Network IP not available');
          }
        }
      } catch (error) {
        console.log('Could not fetch network info:', error);
        // Try to use current host if it's not localhost
        const currentHost = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port || '3000';
        
        if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
          setNetworkUrl(`${protocol}//${currentHost}:${port}`);
        } else {
          setNetworkUrl('Network IP not available');
        }
      }
    };

    fetchNetworkInfo();
    
    // Refresh network info every 30 seconds
    const interval = setInterval(fetchNetworkInfo, 30000);
    
    return () => clearInterval(interval);
  }, []);



  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(networkUrl);
      setCopySuccess(true);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = networkUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleCloseCopySuccess = () => {
    setCopySuccess(false);
  };

  const handleQrCodeOpen = () => {
    setQrDialogOpen(true);
    // Generate QR code after dialog opens
    setTimeout(() => generateQRCode(), 100);
  };

  const handleQrCodeClose = () => {
    setQrDialogOpen(false);
  };

  const generateQRCode = async () => {
    if (!canvasRef.current || !networkUrl || networkUrl === 'Network IP not available') return;

    try {
      await QRCodeGenerator.toCanvas(canvasRef.current, networkUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'al-fees-qr-code.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!networkUrl) return null;

  const isNetworkAvailable = networkUrl !== 'Network IP not available';

  return (
    <>
      <Alert 
        severity={isNetworkAvailable ? "info" : "warning"}
        sx={{ 
          mb: 2, 
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <NetworkWifi sx={{ mr: 1, color: isNetworkAvailable ? 'info.main' : 'warning.main' }} />
            <Box sx={{ flex: 1 }}>
              <AlertTitle sx={{ mb: 0, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                {isNetworkAvailable ? 'Network Access Available' : 'Network Access Not Available'}
              </AlertTitle>
              {!isMobile && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {isNetworkAvailable 
                    ? 'Access from mobile devices on the same network'
                    : 'Start the backend server to enable network access'
                  }
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ ml: 1 }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {isNetworkAvailable ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace',
                    bgcolor: 'background.paper',
                    p: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    flex: isMobile ? '1 1 100%' : 1,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    wordBreak: 'break-all'
                  }}
                >
                  {networkUrl}
                </Typography>
                <IconButton
                  onClick={handleCopy}
                  color="primary"
                  size="small"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    minWidth: 36,
                    height: 36
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Network access is not available. Make sure:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  1. Backend server is running on port 5000
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  2. Your computer is connected to a network
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  3. Firewall allows connections on ports 3000-3001 and 5000
                </Typography>
              </Box>
            )}
            
            {isNetworkAvailable && (
              <>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip
                    icon={<Wifi />}
                    label="Same WiFi Network Required"
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                  <Chip
                    icon={<QrCode />}
                    label="Show QR Code"
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={handleQrCodeOpen}
                    sx={{ cursor: 'pointer' }}
                  />
                </Box>
                
                {isMobile && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    💡 Share this URL with other devices on your WiFi network for mobile access
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Collapse>
      </Alert>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseCopySuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCopySuccess} severity="success" sx={{ width: '100%' }}>
          Network URL copied to clipboard!
        </Alert>
      </Snackbar>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={handleQrCodeClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCode color="primary" />
            <Typography variant="h6">Mobile Access QR Code</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <canvas
              ref={canvasRef}
              style={{
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 2, 
                p: 1, 
                bgcolor: 'grey.100', 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                wordBreak: 'break-all',
                textAlign: 'center',
                width: '100%'
              }}
            >
              {networkUrl}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              📱 Scan this QR code with your mobile device to access AL-Fees on the same WiFi network
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadQRCode} color="primary" variant="outlined">
            Download QR Code
          </Button>
          <Button onClick={handleQrCodeClose} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NetworkInfo;