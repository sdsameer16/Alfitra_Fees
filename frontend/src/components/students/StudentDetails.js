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
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { ArrowBack, Edit, AccountBalance } from '@mui/icons-material';
import { studentsAPI } from '../../services/api';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getStudent(id);
      setStudent(response.data.data);
    } catch (err) {
      setError('Failed to load student details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !student) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Student not found'}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/students')}
          sx={{ mt: 2 }}
        >
          Back to Students
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/students')}
        >
          Back to Students
        </Button>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/students/edit/${id}`)}
        >
          Edit Student
        </Button>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Student Details
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.name}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Roll Number
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.rollNumber}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Class
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.class}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Section
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.section || 'N/A'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.email || 'N/A'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.phone || 'N/A'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Address
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.address || 'N/A'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Guardian Name
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.guardianName || 'N/A'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Guardian Phone
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.guardianPhone || 'N/A'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Date of Birth
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Admission Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
        </Grid>

        {/* Fee Information Section */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Fee Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Fee
                </Typography>
                <Typography variant="h6" color="primary">
                  ₹{(student.fee?.totalFee || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Paid Amount
                </Typography>
                <Typography variant="h6" color="success.main">
                  ₹{(student.fee?.paidAmount || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Balance
                </Typography>
                <Typography 
                  variant="h6" 
                  color={student.fee?.balance === 0 ? 'success.main' : student.fee?.balance > 0 ? 'warning.main' : 'info.main'}
                >
                  ₹{Math.abs(student.fee?.balance || 0).toLocaleString()}
                  {student.fee?.balance < 0 && ' (Adv)'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {student.fee?.balance === 0 ? (
                    <Chip label="Paid" color="success" size="small" />
                  ) : student.fee?.balance > 0 ? (
                    <Chip label="Pending" color="warning" size="small" />
                  ) : (
                    <Chip label="Advance" color="info" size="small" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Fee Breakdown */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Fee Breakdown
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Admission Fee
            </Typography>
            <Typography variant="body1" gutterBottom>
              ₹{(student.fee?.admissionFee || 0).toLocaleString()}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Tuition Fee
            </Typography>
            <Typography variant="body1" gutterBottom>
              ₹{(student.fee?.tuitionFee || 0).toLocaleString()}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Transport Fee
            </Typography>
            <Typography variant="body1" gutterBottom>
              ₹{(student.fee?.transportFee || 0).toLocaleString()}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Other Fee
            </Typography>
            <Typography variant="body1" gutterBottom>
              ₹{(student.fee?.otherFee || 0).toLocaleString()}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Concession
            </Typography>
            <Typography variant="body1" gutterBottom>
              ₹{(student.fee?.concession || 0).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudentDetails;
