import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Divider, 
  Tabs, 
  Tab, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  LinearProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  AccountBalance as BankIcon,
  Badge as BadgeIcon,
  Class as ClassIcon,
  CalendarToday as CalendarIcon,
  Accessibility as GenderIcon,
  Bloodtype as BloodGroupIcon,
  AccountBalanceWallet as WalletIcon,
  AccountBalanceBank as BankAccountIcon,
  ReceiptLong as FeeReceiptIcon,
  PersonPin as GuardianIcon,
  FamilyRestroom as ParentIcon,
  ContactPhone as ContactIcon,
  HomeWork as AddressIcon,
  Description as NotesIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  EventNote as EventNoteIcon,
  AccountCircle as AccountCircleIcon,
  School as SchoolOutlinedIcon,
  LocalAtm as LocalAtmIcon,
  AccountTree as AccountTreeIcon,
  Receipt as ReceiptOutlinedIcon,
  Event as EventIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  PersonOff as PersonOffIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  PersonRemoveAlt1 as PersonRemoveAlt1Icon,
  PersonAddDisabled as PersonAddDisabledIcon,
  PersonRemoveAlt1Outlined as PersonRemoveAlt1OutlinedIcon,
  PersonAddAlt1Outlined as PersonAddAlt1OutlinedIcon,
  PersonRemoveOutlined as PersonRemoveOutlinedIcon,
  PersonAddOutlined as PersonAddOutlinedIcon,
  PersonOffOutlined as PersonOffOutlinedIcon,
  PersonRemoveAlt1Rounded as PersonRemoveAlt1RoundedIcon,
  PersonAddAlt1Rounded as PersonAddAlt1RoundedIcon,
  PersonRemoveRounded as PersonRemoveRoundedIcon,
  PersonAddRounded as PersonAddRoundedIcon,
  PersonOffRounded as PersonOffRoundedIcon,
  PersonRemoveAlt1Sharp as PersonRemoveAlt1SharpIcon,
  PersonAddAlt1Sharp as PersonAddAlt1SharpIcon,
  PersonRemoveSharp as PersonRemoveSharpIcon,
  PersonAddSharp as PersonAddSharpIcon,
  PersonOffSharp as PersonOffSharpIcon,
  PersonRemoveAlt1TwoTone as PersonRemoveAlt1TwoToneIcon,
  PersonAddAlt1TwoTone as PersonAddAlt1TwoToneIcon,
  PersonRemoveTwoTone as PersonRemoveTwoToneIcon,
  PersonAddTwoTone as PersonAddTwoToneIcon,
  PersonOffTwoTone as PersonOffTwoToneIcon,
} from '@mui/icons-material';
import { studentsAPI, feesAPI } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatUtils';
import FeePaymentDialog from '../fees/FeePaymentDialog';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feePaymentDialogOpen, setFeePaymentDialogOpen] = useState(false);
  const [feeHistory, setFeeHistory] = useState([]);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await studentsAPI.getStudent(id);
        setStudent(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching student:', err);
        setError('Failed to load student details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  useEffect(() => {
    if (tabValue === 1) {
      fetchFeeHistory();
    }
  }, [tabValue, id]);

  const fetchFeeHistory = async () => {
    try {
      setFeeLoading(true);
      const response = await feesAPI.getFeesByStudent(id);
      setFeeHistory(response.data.data || []);
      setFeeError('');
    } catch (err) {
      console.error('Error fetching fee history:', err);
      setFeeError('Failed to load fee history. Please try again.');
    } finally {
      setFeeLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await studentsAPI.deleteStudent(id);
      setDeleteDialogOpen(false);
      navigate('/students', {
        state: { message: 'Student deleted successfully', severity: 'success' },
      });
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student. Please try again.');
    }
  };

  const handleFeePaymentSuccess = () => {
    setFeePaymentDialogOpen(false);
    fetchFeeHistory();
    // Refresh student data to update fee balance
    studentsAPI.getStudent(id).then((response) => {
      setStudent(response.data);
    });
  };

  const handlePrintIdCard = () => {
    // Implement ID card printing logic
    console.log('Print ID card for:', student?.firstName);
  };

  const handlePrintFeeReceipt = (receiptId) => {
    // Implement fee receipt printing logic
    console.log('Print receipt:', receiptId);
  };

  const getFeeStatusChip = (balance) => {
    if (balance === 0) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Paid"
          color="success"
          size="small"
          variant="outlined"
        />
      );
    } else if (balance > 0) {
      return (
        <Chip
          icon={<WarningIcon />}
          label={`Pending: ₹${balance.toLocaleString()}`}
          color="warning"
          size="small"
          variant="outlined"
        />
      );
    } else {
      return (
        <Chip
          icon={<InfoIcon />}
          label={`Advance: ₹${Math.abs(balance).toLocaleString()}`}
          color="info"
          size="small"
          variant="outlined"
        />
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <Box>
      {/* Header with back button and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/students')} color="primary" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {student.firstName} {student.lastName}
          </Typography>
          <Chip
            label={student.status === 'active' ? 'Active' : 'Inactive'}
            color={student.status === 'active' ? 'success' : 'default'}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrintIdCard}
            sx={{ mr: 1 }}
          >
            Print ID Card
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PaymentIcon />}
            onClick={() => setFeePaymentDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Collect Fee
          </Button>
          <Button
            component={Link}
            to={`/students/edit/${student._id}`}
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Student Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: 150,
                  height: 180,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'background.paper',
                }}
              >
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={`${student.firstName} ${student.lastName}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <AccountCircleIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">Roll Number</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <BadgeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    {student.rollNumber || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">Class</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ClassIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    {student.class || 'N/A'} {student.section ? `- ${student.section}` : ''}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">Admission Date</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    {student.admissionDate ? formatDate(student.admissionDate) : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">Date of Birth</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventNoteIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    {student.dateOfBirth ? formatDate(student.dateOfBirth) : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <GenderIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    {student.gender || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">Blood Group</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <BloodGroupIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    {student.bloodGroup || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Fee Status</Typography>
                  <Box sx={{ mt: 1 }}>
                    {getFeeStatusChip(student.fee?.balance || 0)}
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Total Fee: {formatCurrency(student.fee?.totalFee || 0)} • 
                      Paid: {formatCurrency(student.fee?.paidAmount || 0)} • 
                      Balance: {formatCurrency(Math.abs(student.fee?.balance || 0))}
                      {student.fee?.balance < 0 && ' (Advance)'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" icon={<InfoIcon />} iconPosition="start" />
          <Tab label="Fee History" icon={<ReceiptIcon />} iconPosition="start" />
          <Tab label="Documents" icon={<PictureAsPdf />} iconPosition="start" />
          <Tab label="Activities" icon={<EventIcon />} iconPosition="start" />
        </Tabs>

        <Divider />

        <TabPanel value={tabValue} index={0}>
          {/* Overview Tab */}
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Personal Information</Typography>
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <BadgeIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Full Name" 
                        secondary={`${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim()} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Date of Birth" 
                        secondary={student.dateOfBirth ? formatDate(student.dateOfBirth) : 'N/A'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <GenderIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Gender" 
                        secondary={student.gender || 'N/A'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <BloodGroupIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Blood Group" 
                        secondary={student.bloodGroup || 'N/A'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <BadgeIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Aadhar Number" 
                        secondary={student.aadharNumber || 'N/A'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <BadgeIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="PAN Number" 
                        secondary={student.panNumber || 'N/A'} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              
              {/* Contact Information */}
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ContactIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Contact Information</Typography>
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Phone Number" 
                        secondary={student.phoneNumber || 'N/A'} 
                      />
                    </ListItem>
                    
                    {student.phoneNumber2 && (
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Alternate Phone" 
                          secondary={student.phoneNumber2} 
                        />
                      </ListItem>
                    )}
                    
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={student.email || 'N/A'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <AddressIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Address" 
                        secondary={
                          <>
                            {student.address && <div>{student.address}</div>}
                            {student.city && <div>{student.city}, {student.state} {student.pincode}</div>}
                            {!student.address && !student.city && 'N/A'}
                          </>
                        } 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Academic & Family Information */}
            <Grid item xs={12} md={6}>
              {/* Academic Information */}
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Academic Information</Typography>
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <BadgeIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Roll Number" 
                        secondary={student.rollNumber || 'N/A'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <ClassIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Class" 
                        secondary={`${student.class || 'N/A'} ${student.section ? `- ${student.section}` : ''}`} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Admission Date" 
                        secondary={student.admissionDate ? formatDate(student.admissionDate) : 'N/A'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <SchoolOutlinedIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Previous School" 
                        secondary={student.previousSchool || 'N/A'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <NotesIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Notes" 
                        secondary={student.notes || 'No additional notes'} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              
              {/* Parent/Guardian Information */}
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ParentIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Parent/Guardian Information</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Father's Details</Typography>
                    <Box sx={{ ml: 2, mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {student.fatherName || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Occupation:</strong> {student.fatherOccupation || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {student.fatherPhone || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Mother's Details</Typography>
                    <Box sx={{ ml: 2, mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {student.motherName || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Occupation:</strong> {student.motherOccupation || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {student.motherPhone || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {(student.guardianName || student.guardianRelation) && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Guardian Details</Typography>
                      <Box sx={{ ml: 2, mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Name:</strong> {student.guardianName || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Relation:</strong> {student.guardianRelation || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong> {student.guardianPhone || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              {/* Fee Information */}
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MoneyIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Fee Information</Typography>
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <LocalAtmIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Total Fee" 
                        secondary={formatCurrency(student.fee?.totalFee || 0)} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <AccountTreeIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Fee Structure" 
                        secondary={
                          <Box component="span">
                            <div>Admission: {formatCurrency(student.fee?.admissionFee || 0)}</div>
                            <div>Tuition: {formatCurrency(student.fee?.tuitionFee || 0)}</div>
                            <div>Transport: {formatCurrency(student.fee?.transportFee || 0)}</div>
                            <div>Other: {formatCurrency(student.fee?.otherFee || 0)}</div>
                          </Box>
                        } 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <ReceiptOutlinedIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Concession" 
                        secondary={formatCurrency(student.fee?.concession || 0)} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color={student.fee?.balance === 0 ? 'success' : 'action'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Paid Amount" 
                        secondary={formatCurrency(student.fee?.paidAmount || 0)} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        {student.fee?.balance > 0 ? (
                          <WarningIcon color="warning" />
                        ) : student.fee?.balance < 0 ? (
                          <InfoIcon color="info" />
                        ) : (
                          <CheckCircleIcon color="success" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={student.fee?.balance > 0 ? 'Balance Due' : student.fee?.balance < 0 ? 'Advance' : 'Status'} 
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {formatCurrency(Math.abs(student.fee?.balance || 0))}
                            {student.fee?.balance > 0 && (
                              <Button 
                                variant="text" 
                                size="small" 
                                color="primary" 
                                onClick={() => setFeePaymentDialogOpen(true)}
                                sx={{ ml: 1 }}
                              >
                                Pay Now
                              </Button>
                            )}
                          </Box>
                        } 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              
              {/* Bank Details */}
              {(student.bankAccountNumber || student.bankName || student.ifscCode) && (
                <Card variant="outlined" sx={{ mt: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BankIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Bank Details</Typography>
                    </Box>
                    
                    <List dense>
                      {student.bankAccountNumber && (
                        <ListItem>
                          <ListItemIcon>
                            <AccountBalanceWalletIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Account Number" 
                            secondary={student.bankAccountNumber} 
                          />
                        </ListItem>
                      )}
                      
                      {student.bankName && (
                        <ListItem>
                          <ListItemIcon>
                            <AccountBalanceBankIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Bank Name" 
                            secondary={student.bankName} 
                          />
                        </ListItem>
                      )}
                      
                      {student.ifscCode && (
                        <ListItem>
                          <ListItemIcon>
                            <ReceiptLongIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="IFSC Code" 
                            secondary={student.ifscCode} 
                          />
                        </ListItem>
                      )}
                      
                      {student.accountHolderName && (
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Account Holder" 
                            secondary={student.accountHolderName} 
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              )}
              
              {/* Documents */}
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PictureAsPdf color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Documents</Typography>
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        {student.hasAadhar ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Aadhar Card" 
                        secondary={student.hasAadhar ? 'Uploaded' : 'Not Uploaded'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        {student.hasBirthCertificate ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Birth Certificate" 
                        secondary={student.hasBirthCertificate ? 'Uploaded' : 'Not Uploaded'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        {student.hasTc ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Transfer Certificate" 
                        secondary={student.hasTc ? 'Uploaded' : 'Not Uploaded'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        {student.hasPhoto ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Passport Photo" 
                        secondary={student.hasPhoto ? 'Uploaded' : 'Not Uploaded'} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Fee History Tab */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Fee Payment History</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PaymentIcon />}
              onClick={() => setFeePaymentDialogOpen(true)}
            >
              New Payment
            </Button>
          </Box>
          
          {feeLoading ? (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
          ) : feeError ? (
            <Alert severity="error">{feeError}</Alert>
          ) : feeHistory.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No fee payment records found.
              </Typography>
            </Paper>
          ) : (
            <Paper variant="outlined">
              <List disablePadding>
                {feeHistory.map((fee, index) => (
                  <React.Fragment key={fee._id}>
                    <ListItem 
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary" sx={{ mr: 2 }}>
                            ₹{fee.amount.toLocaleString()}
                          </Typography>
                          <Tooltip title="Print Receipt">
                            <IconButton 
                              edge="end" 
                              onClick={() => handlePrintFeeReceipt(fee._id)}
                              color="primary"
                            >
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        <ReceiptIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Receipt #${fee.receiptNumber}`}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: 'block' }}
                            >
                              {fee.paymentMode} • {formatDate(fee.paymentDate)}
                            </Typography>
                            {fee.notes && (
                              <Typography variant="body2" color="text.secondary">
                                {fee.notes}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < feeHistory.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Documents Tab */}
          <Typography variant="h6" gutterBottom>
            Student Documents
          </Typography>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Document management feature will be available soon.
            </Typography>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Activities Tab */}
          <Typography variant="h6" gutterBottom>
            Student Activities
          </Typography>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Activity tracking feature will be available soon.
            </Typography>
          </Paper>
        </TabPanel>
      </Paper>

      {/* Fee Payment Dialog */}
      <FeePaymentDialog
        open={feePaymentDialogOpen}
        onClose={() => setFeePaymentDialogOpen(false)}
        student={student}
        onSuccess={handleFeePaymentSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {student.firstName} {student.lastName}? 
            This action cannot be undone and will permanently remove all student data, 
            including fee records and other related information.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete Student
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDetail;
