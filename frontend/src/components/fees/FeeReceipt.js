import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { ArrowBack, Print } from '@mui/icons-material';
import { feesAPI } from '../../services/api';

const FeeReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFee = useCallback(async () => {
    try {
      setLoading(true);
      const response = await feesAPI.getFee(id);
      setFee(response.data.data);
    } catch (err) {
      setError('Failed to load receipt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFee();
  }, [fetchFee]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !fee) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Receipt not found'}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/fees')}
          sx={{ mt: 2 }}
        >
          Back to Fees
        </Button>
      </Container>
    );
  }

  return (
    <>
      <style>
        {`
          @media print {
            /* Hide everything by default */
            body * {
              visibility: hidden;
            }
            
            /* Show only the receipt container and its children */
            #fee-receipt-container,
            #fee-receipt-container * {
              visibility: visible;
            }
            
            /* Position receipt at top-left of page */
            #fee-receipt-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            
            /* Hide no-print elements */
            .no-print {
              display: none !important;
            }
            
            /* Ensure colors print correctly */
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            /* Set page margins */
            @page {
              margin: 0.5in;
              size: auto;
            }
          }
        `}
      </style>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box 
          sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} 
          className="no-print"
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/fees')}
          >
            Back to Fees
          </Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Print Receipt
          </Button>
        </Box>

        <Paper id="fee-receipt-container" sx={{ p: 4, border: '2px solid #000' }} elevation={3}>
          {/* Header with Logo in Center and Date/Time on Right */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid size={{ xs: 3 }}>
                {/* Empty space for balance */}
              </Grid>
              <Grid size={{ xs: 6 }}>
                {/* School Logo and Name in Center */}
                <Box sx={{ textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      margin: '0 auto 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img 
                      src="/logo&Stmp.png" 
                      alt="AL-FITRAH School Logo" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain' 
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <Box 
                      sx={{ 
                        width: 80, 
                        height: 80,
                        border: '2px solid #000',
                        borderRadius: '50%',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        AF
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    AL-FITRAH E.M HIGH SCHOOL
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chandole,522311-RC No. 7230/D5/2019
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fee Payment Receipt
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 3 }}>
                {/* Date and Time on Right */}
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Date:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(fee.paymentDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Time:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(fee.createdAt || fee.paymentDate).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2, borderColor: '#000' }} />

          {/* Receipt Number */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Receipt No: {fee.receiptNumber}
            </Typography>
          </Box>

          {/* Student Details */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 8 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Student Name:</strong> {fee.student ? `${fee.student.firstName} ${fee.student.lastName}` : 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Roll No:</strong> {fee.student?.rollNumber || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body1">
                  <strong>Class:</strong> {fee.student?.class || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body1">
                  <strong>Money Paid By:</strong> {fee.paidBy?.name || 'N/A'} ({fee.paidBy?.relation || 'Parent'})
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Fee Details Table */}
          <TableContainer sx={{ mb: 2 }}>
            <Table size="small" sx={{ border: '1px solid #ddd' }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Fee Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Description</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Amount (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fee.items && fee.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ border: '1px solid #ddd' }}>
                      {item.category}
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #ddd' }}>
                      {item.description || '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ border: '1px solid #ddd' }}>
                      ₹{item.amount.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Amount Summary */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 8 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                  AMOUNT PAID NOW:
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                  ₹{fee.totalAmount?.toLocaleString('en-IN')}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Payment Mode and Balance */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body1">
                  <strong>Payment Mode:</strong> {fee.paymentMode}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body1" sx={{ textAlign: 'right' }}>
                  <strong>Balance Amount:</strong> ₹{Math.abs(fee.balanceAfterPayment || 0).toLocaleString('en-IN')}
                  {fee.balanceAfterPayment < 0 && ' (Advance)'}
                  {fee.balanceAfterPayment === 0 && ' (Fully Paid)'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {fee.remarks && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Remarks:</strong> {fee.remarks}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Footer for Principal Signature and Stamp */}
          <Box sx={{ mt: 6, minHeight: '120px' }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Received by:
                  </Typography>
                  <Box sx={{ borderTop: '1px solid #000', pt: 1, mt: 5, width: '200px' }}>
                    <Typography variant="caption">
                      Cashier / Accountant
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Authorized by:
                  </Typography>
                  <Box sx={{ display: 'inline-block', textAlign: 'center', mt: 5 }}>
                    <Box sx={{ 
                      minWidth: '150px',
                      minHeight: '80px',
                      mb: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img 
                        src="/logo&Stmp.png" 
                        alt="School Stamp" 
                        style={{ 
                          maxWidth: '150px', 
                          maxHeight: '80px',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.border = '1px dashed #999';
                          e.target.parentElement.style.padding = '10px 20px';
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Principal
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Footer Note */}
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px dashed #ddd', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              This is a computer-generated receipt. For any queries, please contact the school office &copy; 2025 AL-FITRAH E.M HIGH SCHOOL.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default FeeReceipt;
