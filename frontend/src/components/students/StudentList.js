import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  CardActions,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentsAPI } from '../../services/api';

// Mobile-friendly student card component
const StudentCard = ({ student, onView, onEdit, onDelete }) => {
  const getStatusColor = (feeStatus) => {
    switch (feeStatus) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'pending': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (feeStatus) => {
    switch (feeStatus) {
      case 'paid': return 'Paid';
      case 'partial': return 'Partial';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <Card elevation={2} sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {student.rollNumber || student.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold" noWrap>
              {student.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Roll No: {student.rollNumber}
            </Typography>
          </Box>
          <Chip
            label={getStatusText(student.feeStatus)}
            color={getStatusColor(student.feeStatus)}
            size="small"
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Class
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {student.class}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Mother's Name
              </Typography>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {student.motherName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Contact
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {student.contactNumber}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Total Fees
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                ₹{student.totalFees?.toLocaleString() || 0}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => onView(student._id)}
        >
          View
        </Button>
        <Box>
          <IconButton
            size="small"
            onClick={() => onEdit(student._id)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(student)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

const StudentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [feeStatusFilter, setFeeStatusFilter] = useState('all');
  const [sortByFees, setSortByFees] = useState('none');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (searchTerm) {
        params.q = searchTerm;
      }

      if (classFilter && classFilter !== 'all') {
        params.class = classFilter;
      }

      if (feeStatusFilter !== 'all') {
        if (feeStatusFilter === 'pending') {
          params.feeStatus = 'pending';
        } else if (feeStatusFilter === 'completed') {
          params.feeStatus = 'completed';
        }
      }

      if (sortByFees !== 'none') {
        params.sortByFees = sortByFees; // 'desc' or 'asc'
      }

      const response = await studentsAPI.getStudents(params);
      setStudents(response.data.data);
      setTotal(response.data.count);
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await studentsAPI.getClasses();
      setClasses(response.data);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchTerm, classFilter, feeStatusFilter, sortByFees]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      setTimeout(() => setSuccessMessage(''), 5000);
      // Clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClassFilterChange = (event) => {
    setClassFilter(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      await studentsAPI.deleteStudent(studentToDelete._id);
      setDeleteDialogOpen(false);
      fetchStudents(); // Refresh the list
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student. Please try again.');
    }
  };

  const handleViewStudent = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  const handleEditStudent = (studentId) => {
    navigate(`/students/${studentId}/edit`);
  };

  const handleApplyFilters = () => {
    setPage(0);
    setFilterDialogOpen(false);
  };

  const handleClearFilters = () => {
    setFeeStatusFilter('all');
    setSortByFees('none');
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={{ xs: "h5", md: "h4" }} 
          gutterBottom
          sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}
        >
          Students
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 }
        }}>
          <Typography 
            variant={{ xs: "body2", md: "body1" }} 
            color="textSecondary"
            sx={{ order: { xs: 2, md: 1 } }}
          >
            Manage student records and information
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/students/new')}
          >
            Add Student
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search students..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="class-filter-label">Class</InputLabel>
                <Select
                  labelId="class-filter-label"
                  value={classFilter}
                  onChange={handleClassFilterChange}
                  label="Class"
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls} value={cls}>
                      {cls}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDialogOpen(true)}
              >
                Filters
                {(feeStatusFilter !== 'all' || sortByFees !== 'none') && (
                  <Chip 
                    label="Active" 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1, height: 20 }}
                  />
                )}
              </Button>
            </Grid>
          </Grid>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Paper variant="outlined" sx={{ width: '100%', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {isMobile ? (
                  // Mobile Card View
                  <Box sx={{ px: 1 }}>
                    {students.map((student) => (
                      <StudentCard
                        key={student._id}
                        student={student}
                        onView={(id) => navigate(`/students/${id}`)}
                        onEdit={(id) => navigate(`/students/edit/${id}`)}
                        onDelete={(student) => {
                          setStudentToDelete(student);
                          setDeleteDialogOpen(true);
                        }}
                      />
                    ))}
                    {students.length === 0 && (
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                          No students found matching your criteria.
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                ) : (
                  // Desktop Table View
                  <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No.</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Father's Name</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Fee Status</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.length > 0 ? (
                        students.map((student) => (
                          <TableRow hover key={student._id}>
                            <TableCell>{student.rollNumber}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                  src={student.photo} 
                                  alt={`${student.firstName} ${student.lastName}`}
                                  sx={{ width: 40, height: 40 }}
                                >
                                  {!student.photo && <PersonIcon />}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1">
                                    {student.firstName} {student.lastName}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {student.gender}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell>{student.fatherName || 'N/A'}</TableCell>
                            <TableCell>
                              {student.phoneNumber || 'N/A'}
                              {student.phoneNumber2 && (
                                <Typography variant="caption" display="block">
                                  {student.phoneNumber2}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {student.fee?.balance === 0 ? (
                                <Chip label="Paid" color="success" size="small" />
                              ) : student.fee?.balance > 0 ? (
                                <Chip label="Pending" color="warning" size="small" />
                              ) : (
                                <Chip label="Advance" color="info" size="small" />
                              )}
                            </TableCell>
                            <TableCell>
                              ₹{Math.abs(student.fee?.balance || 0).toLocaleString()}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="View">
                                <IconButton
                                  onClick={() => handleViewStudent(student._id)}
                                  size="small"
                                  color="primary"
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  onClick={() => handleEditStudent(student._id)}
                                  size="small"
                                  color="primary"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  onClick={() => handleDeleteClick(student)}
                                  size="small"
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                            <Typography color="textSecondary">
                              No students found. Add a new student to get started.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  </TableContainer>
                )}
                
                {/* Pagination for both mobile and desktop */}
                <TablePagination
                  rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25, 50]}
                  component="div"
                  count={total}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    '.MuiTablePagination-toolbar': {
                      px: { xs: 1, md: 2 },
                    },
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                    },
                  }}
                />
              </>
            )}
          </Paper>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {studentToDelete?.firstName}{' '}
            {studentToDelete?.lastName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Students</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="fee-status-filter-label">Fee Status</InputLabel>
              <Select
                labelId="fee-status-filter-label"
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(e.target.value)}
                label="Fee Status"
              >
                <MenuItem value="all">All Students</MenuItem>
                <MenuItem value="pending">Pending Fees Only</MenuItem>
                <MenuItem value="completed">Completed Fees Only</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="sort-fees-label">Sort by Balance</InputLabel>
              <Select
                labelId="sort-fees-label"
                value={sortByFees}
                onChange={(e) => setSortByFees(e.target.value)}
                label="Sort by Balance"
              >
                <MenuItem value="none">No Sorting</MenuItem>
                <MenuItem value="desc">Highest Balance First</MenuItem>
                <MenuItem value="asc">Lowest Balance First</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters} color="secondary">
            Clear Filters
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleApplyFilters} color="primary" variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentList;
