import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Alert
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { feesAPI, studentsAPI } from '../../services/api';

const FeePayment = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    student: null,
    amount: '',
    paymentDate: new Date(),
    paymentMode: 'Cash',
    feeType: 'tuition',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    paidByName: '',
    paidByRelation: 'Father',
    paidByContact: '',
    remarks: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getStudents({ limit: 1000 });
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        student: formData.student?._id,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMode: formData.paymentMode,
        feeType: formData.feeType,
        month: formData.month,
        year: formData.year,
        paidBy: {
          name: formData.paidByName || formData.student?.fatherName || 'Guardian',
          relation: formData.paidByRelation,
          contact: formData.paidByContact || formData.student?.phoneNumber || ''
        },
        remarks: formData.remarks
      };

      await feesAPI.createFee(payload);
      setSuccess('Fee payment recorded successfully!');
      setTimeout(() => {
        navigate('/fees', { replace: true });
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/fees')}
        >
          Back to Fees
        </Button>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Record Fee Payment
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                options={students}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} - ${option.rollNumber}`}
                value={formData.student}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, student: newValue });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Student" required />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                required
                value={formData.amount}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Payment Date"
                value={formData.paymentDate}
                onChange={(date) => setFormData({ ...formData, paymentDate: date })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Payment Mode</InputLabel>
                <Select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  label="Payment Mode"
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Fee Type</InputLabel>
                <Select
                  name="feeType"
                  value={formData.feeType}
                  onChange={handleChange}
                  label="Fee Type"
                >
                  <MenuItem value="tuition">Tuition Fee</MenuItem>
                  <MenuItem value="exam">Exam Fee</MenuItem>
                  <MenuItem value="library">Library Fee</MenuItem>
                  <MenuItem value="transport">Transport Fee</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  label="Month"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="January">January</MenuItem>
                  <MenuItem value="February">February</MenuItem>
                  <MenuItem value="March">March</MenuItem>
                  <MenuItem value="April">April</MenuItem>
                  <MenuItem value="May">May</MenuItem>
                  <MenuItem value="June">June</MenuItem>
                  <MenuItem value="July">July</MenuItem>
                  <MenuItem value="August">August</MenuItem>
                  <MenuItem value="September">September</MenuItem>
                  <MenuItem value="October">October</MenuItem>
                  <MenuItem value="November">November</MenuItem>
                  <MenuItem value="December">December</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 2000, max: 2100 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Paid By (Name)"
                name="paidByName"
                value={formData.paidByName}
                onChange={handleChange}
                placeholder="Leave empty to use Father's name"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Relation</InputLabel>
                <Select
                  name="paidByRelation"
                  value={formData.paidByRelation}
                  onChange={handleChange}
                  label="Relation"
                >
                  <MenuItem value="Father">Father</MenuItem>
                  <MenuItem value="Mother">Mother</MenuItem>
                  <MenuItem value="Guardian">Guardian</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Number"
                name="paidByContact"
                value={formData.paidByContact}
                onChange={handleChange}
                placeholder="Leave empty to use student's contact"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                multiline
                rows={3}
                value={formData.remarks}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/fees')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Payment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default FeePayment;
