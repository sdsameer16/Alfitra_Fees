import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  AccountBalanceWallet as WalletIcon,
  LocalAtm as CashIcon,
  SwapHoriz as TransferIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { feesAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatUtils';

const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: <CashIcon /> },
  { value: 'cheque', label: 'Cheque', icon: <DescriptionIcon /> },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: <TransferIcon /> },
  { value: 'upi', label: 'UPI', icon: <PaymentIcon /> },
  { value: 'debit_card', label: 'Debit Card', icon: <CardIcon /> },
  { value: 'credit_card', label: 'Credit Card', icon: <CardIcon /> },
  { value: 'net_banking', label: 'Net Banking', icon: <BankIcon /> },
  { value: 'wallet', label: 'Wallet', icon: <WalletIcon /> },
];

const FeePaymentDialog = ({ open, onClose, student, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: new Date(),
    paymentMode: 'cash',
    referenceNumber: '',
    description: '',
    feeType: 'tuition',
    academicYear: '2023-2024',
    month: format(new Date(), 'MMMM yyyy'),
  });

  useEffect(() => {
    if (open) {
      setFormData({
        amount: student?.fee?.balance > 0 ? student.fee.balance.toString() : '',
        paymentDate: new Date(),
        paymentMode: 'cash',
        referenceNumber: '',
        description: '',
        feeType: 'tuition',
        academicYear: '2023-2024',
        month: format(new Date(), 'MMMM yyyy'),
      });
      setError('');
      setSuccess('');
    }
  }, [open, student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      paymentDate: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const paymentData = {
        student: student._id,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMode: formData.paymentMode,
        referenceNumber: formData.referenceNumber || undefined,
        description: formData.description || undefined,
        feeType: formData.feeType,
        academicYear: formData.academicYear,
        month: formData.month,
      };

      await feesAPI.createFee(paymentData);
      
      setSuccess('Payment recorded successfully!');
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error recording payment:', err);
      setError(err.response?.data?.message || 'Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    console.log('Printing receipt...');
  };

  const handleDownloadReceipt = () => {
    console.log('Downloading receipt...');
  };

  const getMaxAmount = () => {
    if (!student?.fee?.balance) return 0;
    return student.fee.balance;
  };

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : null}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <MoneyIcon color="primary" sx={{ mr: 1 }} />
            <span>Record Fee Payment</span>
          </Box>
          <IconButton 
            onClick={onClose} 
            disabled={loading}
            size="small"
            sx={{ p: 0.5 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="subtitle2" color="textSecondary">
          {student?.firstName} {student?.lastName} • {student?.class} {student?.section}
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'action.hover' }}>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="textSecondary">Total Fee:</Typography>
                      <Typography variant="h6">
                        {formatCurrency(student?.fee?.totalFee || 0)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="textSecondary">Paid Amount:</Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(student?.fee?.paidAmount || 0)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="textSecondary">Balance:</Typography>
                      <Typography 
                        variant="h6" 
                        color={student?.fee?.balance > 0 ? 'error' : 'success.main'}
                      >
                        {formatCurrency(Math.abs(student?.fee?.balance || 0))}
                        {student?.fee?.balance < 0 && ' (Advance)'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="textSecondary">Last Payment:</Typography>
                      <Typography variant="body2">
                        {student?.lastPaymentDate 
                          ? format(new Date(student.lastPaymentDate), 'dd MMM yyyy') 
                          : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Amount (₹)"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  disabled={loading}
                  inputProps={{ 
                    min: "0",
                    step: "1",
                    max: getMaxAmount()
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  helperText={`Max: ${formatCurrency(getMaxAmount())}`}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel id="payment-mode-label">Payment Method</InputLabel>
                  <Select
                    labelId="payment-mode-label"
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    label="Payment Method"
                    disabled={loading}
                  >
                    {paymentMethods.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        <Box display="flex" alignItems="center">
                          <Box mr={1} display="flex" alignItems="center">
                            {method.icon}
                          </Box>
                          {method.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {['cheque', 'bank_transfer', 'upi', 'debit_card', 'credit_card', 'net_banking'].includes(formData.paymentMode) && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Reference Number"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </Grid>
              )}
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Payment Date"
                    value={formData.paymentDate}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true, required: true, disabled: loading } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="fee-type-label">Fee Type</InputLabel>
                  <Select
                    labelId="fee-type-label"
                    name="feeType"
                    value={formData.feeType}
                    onChange={handleChange}
                    label="Fee Type"
                    disabled={loading}
                  >
                    <MenuItem value="tuition">Tuition Fee</MenuItem>
                    <MenuItem value="admission">Admission Fee</MenuItem>
                    <MenuItem value="transport">Transport Fee</MenuItem>
                    <MenuItem value="exam">Exam Fee</MenuItem>
                    <MenuItem value="library">Library Fee</MenuItem>
                    <MenuItem value="sports">Sports Fee</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Academic Year"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Month"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="e.g. January 2023"
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Additional notes about this payment..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Box>
            {!success && (
              <Button
                onClick={onClose}
                color="inherit"
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </Box>
          
          <Box>
            {success ? (
              <>
                <Tooltip title="Print Receipt">
                  <IconButton 
                    onClick={handlePrintReceipt}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download PDF">
                  <IconButton 
                    onClick={handleDownloadReceipt}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <PdfIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  onClick={onClose}
                  color="primary"
                  variant="contained"
                >
                  Done
                </Button>
              </>
            ) : (
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Processing...' : 'Record Payment'}
              </Button>
            )}
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FeePaymentDialog;
