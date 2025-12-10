import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Typography,
  Box,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Add, Search, Visibility } from '@mui/icons-material';
import { feesAPI } from '../../services/api';

const FeeList = () => {
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  console.log('FeeList component rendered!');

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching fees with params:', { page: page + 1, limit: rowsPerPage, search: searchTerm });
      const response = await feesAPI.getFees({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      console.log('Fees API Response:', response);
      console.log('Fees data:', response.data);
      setFees(response.data.data || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching fees:', error);
      console.error('Error response:', error.response);
      setFees([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Fee Payments</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/fees/pay')}
        >
          New Payment
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by receipt number, student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Receipt #</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Payment Mode</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : fees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No fee payments found. Click "New Payment" to record a payment.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              fees.map((fee) => (
                <TableRow key={fee._id}>
                  <TableCell>{fee.receiptNumber}</TableCell>
                  <TableCell>
                    {fee.student ? `${fee.student.firstName} ${fee.student.lastName}` : 'N/A'}
                  </TableCell>
                  <TableCell>₹{fee.totalAmount?.toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(fee.paymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{fee.paymentMode}</TableCell>
                  <TableCell>
                    <Chip
                      label="Paid"
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/fees/receipt/${fee._id}`)}
                      title="View Receipt"
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Container>
  );
};

export default FeeList;
