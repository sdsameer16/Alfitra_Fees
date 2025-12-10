import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Download, Assessment } from '@mui/icons-material';

const Reports = () => {
  const [reportType, setReportType] = useState('fee-collection');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [classFilter, setClassFilter] = useState('all');

  const handleGenerateReport = () => {
    // Implementation for report generation
    console.log('Generating report:', { reportType, startDate, endDate, classFilter });
  };

  const reportTypes = [
    { value: 'fee-collection', label: 'Fee Collection Report' },
    { value: 'defaulters', label: 'Fee Defaulters Report' },
    { value: 'student-wise', label: 'Student-wise Report' },
    { value: 'class-wise', label: 'Class-wise Report' },
    { value: 'monthly', label: 'Monthly Summary' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate Report
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Class Filter</InputLabel>
              <Select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                label="Class Filter"
              >
                <MenuItem value="all">All Classes</MenuItem>
                <MenuItem value="1">Class 1</MenuItem>
                <MenuItem value="2">Class 2</MenuItem>
                <MenuItem value="3">Class 3</MenuItem>
                {/* Add more classes as needed */}
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              startIcon={<Assessment />}
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2}>
            {reportTypes.map((type) => (
              <Grid size={{ xs: 12, sm: 6 }} key={type.value}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {type.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generate detailed {type.label.toLowerCase()} for the selected period.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => setReportType(type.value)}
                    >
                      Select
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports;
