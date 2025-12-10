import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { studentsAPI } from '../../services/api';

const FeeManagement = () => {
  const [classFees, setClassFees] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchClassFees();
  }, []);

  const fetchClassFees = async () => {
    // Fallback class fees data
    const fallbackFees = {
      'Class 1': { tuitionFee: 15000, admissionFee: 5000 },
      'Class 2': { tuitionFee: 16000, admissionFee: 5000 },
      'Class 3': { tuitionFee: 17000, admissionFee: 5000 },
      'Class 4': { tuitionFee: 18000, admissionFee: 5000 },
      'Class 5': { tuitionFee: 19000, admissionFee: 5000 },
      'Class 6': { tuitionFee: 22000, admissionFee: 5000 },
      'Class 7': { tuitionFee: 24000, admissionFee: 5000 },
      'Class 8': { tuitionFee: 26000, admissionFee: 5000 },
      'Class 9': { tuitionFee: 28000, admissionFee: 5000 },
      'Class 10': { tuitionFee: 30000, admissionFee: 5000 }
    };
    
    try {
      setLoading(true);
      const response = await studentsAPI.getClassFees();
      if (response.data && response.data.data) {
        setClassFees(response.data.data);
      } else {
        setClassFees(fallbackFees);
        setMessage({
          type: 'warning',
          text: 'Using default class fees. API connection failed.'
        });
      }
    } catch (error) {
      console.error('Error fetching class fees:', error);
      setClassFees(fallbackFees);
      setMessage({
        type: 'warning',
        text: 'Using default class fees. Server connection failed.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeeChange = (className, feeType, value) => {
    setClassFees(prev => ({
      ...prev,
      [className]: {
        ...prev[className],
        [feeType]: parseFloat(value) || 0
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await studentsAPI.updateClassFees(classFees);
      setMessage({
        type: 'success',
        text: 'Class fees updated successfully!'
      });
    } catch (error) {
      console.error('Error saving class fees:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save class fees. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 2 }} />
          Fee Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          size="large"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <MoneyIcon sx={{ mr: 1 }} />
            Class-wise Fee Structure
          </Typography>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Set the standard tuition and admission fees for each class. These will be automatically 
            applied when a student is assigned to a class.
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Class</strong></TableCell>
                  <TableCell align="right"><strong>Admission Fee (₹)</strong></TableCell>
                  <TableCell align="right"><strong>Tuition Fee (₹)</strong></TableCell>
                  <TableCell align="right"><strong>Total (₹)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(classFees).map(([className, fees]) => (
                  <TableRow key={className} hover>
                    <TableCell component="th" scope="row">
                      <strong>{className}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={fees.admissionFee || ''}
                        onChange={(e) => handleFeeChange(className, 'admissionFee', e.target.value)}
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={fees.tuitionFee || ''}
                        onChange={(e) => handleFeeChange(className, 'tuitionFee', e.target.value)}
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ₹{((fees.admissionFee || 0) + (fees.tuitionFee || 0)).toLocaleString('en-IN')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="textSecondary">
            <strong>Note:</strong> These fees will be automatically populated when creating new students. 
            You can still modify individual student fees as needed during registration.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FeeManagement;