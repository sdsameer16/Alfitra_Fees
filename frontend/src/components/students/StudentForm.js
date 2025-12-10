import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { studentsAPI } from '../../services/api';

const steps = ['Personal Details', 'Academic Details', 'Fee Details'];

const validationSchema = Yup.object({
  // Personal Details
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  bloodGroup: Yup.string(),
  aadharNumber: Yup.string().matches(/^\d{12}$/, 'Aadhar must be 12 digits'),
  penNumber: Yup.string(),
  
  // Contact Details
  email: Yup.string().email('Invalid email'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  phoneNumber2: Yup.string().matches(
    /^[0-9]{10}$/,
    'Alternate phone must be 10 digits'
  ),
  
  // Address
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  pincode: Yup.string()
    .matches(/^[1-9][0-9]{5}$/, 'Invalid pincode')
    .required('Pincode is required'),
  
  // Academic Details
  rollNumber: Yup.string().required('Roll number is required'),
  class: Yup.string().required('Class is required'),
  section: Yup.string(),
  admissionDate: Yup.date().required('Admission date is required'),
  
  // Parent/Guardian Details
  fatherName: Yup.string().required("Father's name is required"),
  fatherOccupation: Yup.string(),
  fatherPhone: Yup.string().matches(
    /^[0-9]{10}$/,
    "Father's phone must be 10 digits"
  ),
  fatherAadhar: Yup.string().matches(/^\d{12}$/, 'Father Aadhar must be 12 digits'),
  motherName: Yup.string().required("Mother's name is required"),
  motherOccupation: Yup.string(),
  motherPhone: Yup.string().matches(
    /^[0-9]{10}$/,
    "Mother's phone must be 10 digits"
  ),
  motherAadhar: Yup.string().matches(/^\d{12}$/, 'Mother Aadhar must be 12 digits'),
  guardianName: Yup.string(),
  guardianRelation: Yup.string(),
  guardianPhone: Yup.string().matches(
    /^[0-9]{10}$/,
    'Guardian phone must be 10 digits'
  ),
  
  // Fee Details
  fee: Yup.object({
    admissionFee: Yup.number().min(0, 'Must be positive').required('Required'),
    tuitionFee: Yup.number().min(0, 'Must be positive').required('Required'),
    transportFee: Yup.number().min(0, 'Must be positive').default(0),
    otherFee: Yup.number().min(0, 'Must be positive').default(0),
    concession: Yup.number()
      .min(0, 'Must be positive')
      .test(
        'is-less-than-total',
        'Concession cannot be more than total fee',
        function (value) {
          const { admissionFee = 0, tuitionFee = 0, transportFee = 0, otherFee = 0 } = this.parent || {};
          const totalFee = admissionFee + tuitionFee + transportFee + otherFee;
          return value <= totalFee;
        }
      )
      .default(0),
  }),
  
  // Bank Details
  bankAccountNumber: Yup.string(),
  bankName: Yup.string(),
  ifscCode: Yup.string(),
  accountHolderName: Yup.string(),
  
  // Documents
  hasAadhar: Yup.boolean().default(false),
  hasBirthCertificate: Yup.boolean().default(false),
  hasTc: Yup.boolean().default(false),
  hasPhoto: Yup.boolean().default(false),
});

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);
  const [classFees, setClassFees] = useState({});
  const [sections] = useState(['A', 'B', 'C', 'D']);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Helper function to prevent Enter key from submitting form
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && activeStep !== 2) {
      console.log('BLOCKED: Enter key in TextField prevented form submission');
      e.preventDefault();
    }
  };

  // Handle class selection and auto-populate tuition fees
  const handleClassChange = (event) => {
    const selectedClass = event.target.value;
    console.log('=== CLASS SELECTION CHANGED ===');
    console.log('Selected class:', selectedClass);
    console.log('Available classFees:', classFees);
    console.log('Class fee data for selected class:', classFees[selectedClass]);
    
    formik.setFieldValue('class', selectedClass);
    
    // Auto-populate tuition fee based on class
    if (classFees[selectedClass]) {
      const classData = classFees[selectedClass];
      console.log('Found class data:', classData);
      const currentFee = { ...formik.values.fee };
      currentFee.tuitionFee = classData.tuitionFee;
      currentFee.admissionFee = classData.admissionFee; // Also set admission fee
      
      // Recalculate total fee
      const totalFee = (currentFee.admissionFee || 0) + 
                       (currentFee.tuitionFee || 0) + 
                       (currentFee.transportFee || 0) + 
                       (currentFee.otherFee || 0) + 
                       (currentFee.arrears || 0);
      const balance = totalFee - (currentFee.concession || 0) - (currentFee.paidAmount || 0);
      
      console.log('Setting new fee values:', {
        ...currentFee,
        totalFee,
        balance,
      });
      
      formik.setFieldValue('fee', {
        ...currentFee,
        totalFee,
        balance,
      });
    } else {
      console.log('No class fee data found for:', selectedClass);
    }
  };

  const formik = useFormik({
    initialValues: {
      // Personal Details
      firstName: '',
      lastName: '',
      gender: '',
      dateOfBirth: null,
      bloodGroup: '',
      aadharNumber: '',
      penNumber: '',
      
      // Contact Details
      email: '',
      phoneNumber: '',
      phoneNumber2: '',
      
      // Address
      address: '',
      city: '',
      state: '',
      pincode: '',
      
      // Academic Details
      rollNumber: '',
      class: '',
      section: '',
      admissionDate: null,
      
      // Parent/Guardian Details
      fatherName: '',
      fatherOccupation: '',
      fatherPhone: '',
      fatherAadhar: '',
      motherName: '',
      motherOccupation: '',
      motherPhone: '',
      motherAadhar: '',
      guardianName: '',
      guardianRelation: '',
      guardianPhone: '',
      
      // Fee Details
      fee: {
        admissionFee: 0,
        tuitionFee: 0,
        transportFee: 0,
        otherFee: 0,
        arrears: 0,
        concession: 0,
        totalFee: 0,
        paidAmount: 0,
        balance: 0,
      },
      
      // Bank Details
      bankAccountNumber: '',
      bankName: '',
      ifscCode: '',
      accountHolderName: '',
      
      // Documents
      hasAadhar: false,
      hasBirthCertificate: false,
      hasTc: false,
      hasPhoto: false,
      
      // System Fields
      status: 'active',
      createdBy: '',
      updatedBy: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        
        console.log('=== FORM SUBMISSION STARTED ===');
        console.log('Current active step:', activeStep);
        console.log('Should be on step 2 (fee details) before submitting');
        
        // Ensure we're on the final step before submitting
        if (activeStep !== 2) {
          console.log('ERROR: Form submitted but not on final step!');
          setError('Please complete all steps before submitting');
          setLoading(false);
          return;
        }
        
        console.log('Form submitted with values:', JSON.stringify(values, null, 2));
        console.log('Image file:', imageFile);
        console.log('Is Edit Mode:', isEditMode);
        
        // Calculate total fee
        const { admissionFee, tuitionFee, transportFee, otherFee, concession } = values.fee;
        const totalFee = admissionFee + tuitionFee + transportFee + otherFee;
        const balance = totalFee - concession - (values.fee.paidAmount || 0);
        
        const studentData = {
          ...values,
          fee: {
            ...values.fee,
            totalFee,
            balance,
          },
        };
        
        console.log('=== STUDENT DATA PREPARED ===');
        console.log('Student data to be sent:', JSON.stringify(studentData, null, 2));
        console.log('Total Fee:', totalFee);
        console.log('Balance:', balance);
        
        if (imageFile) {
          console.log('=== IMAGE PROCESSING ===');
          console.log('Image file present, size:', imageFile.size, 'type:', imageFile.type);
          console.log('Image preview length:', imagePreview?.length);
          // Convert image to base64 and add to studentData
          studentData.photo = imagePreview; // imagePreview already contains base64 data
          studentData.hasPhoto = true;
          console.log('Photo added to studentData, hasPhoto set to true');
        } else if (imagePreview && isEditMode) {
          console.log('=== KEEPING EXISTING PHOTO ===');
          // Keep existing photo if in edit mode
          studentData.photo = imagePreview;
          console.log('Existing photo preserved in edit mode');
        } else {
          console.log('=== NO PHOTO ===');
          console.log('No image file or preview available');
        }
        
        console.log('=== SENDING API REQUEST ===');
        let response;
        if (isEditMode) {
          console.log('Updating student with ID:', id);
          response = await studentsAPI.updateStudent(id, studentData);
        } else {
          console.log('Creating new student');
          response = await studentsAPI.createStudent(studentData);
        }
        
        console.log('=== API RESPONSE RECEIVED ===');
        console.log('API Response:', JSON.stringify(response.data, null, 2));
        
        console.log('=== NAVIGATING TO STUDENT LIST ===');
        
        navigate('/students', {
          state: {
            message: `Student ${isEditMode ? 'updated' : 'created'} successfully`,
            severity: 'success',
          },
        });
      } catch (err) {
        console.error('=== ERROR SAVING STUDENT ===');
        console.error('Error object:', err);
        console.error('Error message:', err.message);
        console.error('Error response:', err.response);
        console.error('Error response data:', err.response?.data);
        console.error('Error response status:', err.response?.status);
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            `Failed to ${isEditMode ? 'update' : 'create'} student. Please try again.`
        );
      } finally {
        setLoading(false);
        console.log('=== FORM SUBMISSION ENDED ===');
      }
    },
  });

  useEffect(() => {
    const fetchStudent = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        const response = await studentsAPI.getStudent(id);
        const student = response.data.data;
        
        // Format dates for the date picker
        if (student.dateOfBirth) {
          student.dateOfBirth = new Date(student.dateOfBirth);
        }
        if (student.admissionDate) {
          student.admissionDate = new Date(student.admissionDate);
        }
        
        formik.setValues(student);
        
        if (student.photo) {
          setImagePreview(student.photo);
        }
      } catch (err) {
        console.error('Error fetching student:', err);
        setError('Failed to load student data. Please try again.');
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
    
    const fetchClassFees = async () => {
      // Always use fallback data for now until API is working properly
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
        console.log('=== FETCHING CLASS FEES ===');
        const response = await studentsAPI.getClassFees();
        console.log('Class fees response:', response);
        if (response.data && response.data.data) {
          console.log('Using API class fees data:', response.data.data);
          setClassFees(response.data.data);
        } else {
          console.log('API response invalid, using fallback class fees');
          setClassFees(fallbackFees);
        }
      } catch (err) {
        console.error('Error fetching class fees:', err);
        console.log('Using fallback class fees due to API error');
        setClassFees(fallbackFees);
      }
    };
    
    fetchStudent();
    fetchClasses();
    fetchClassFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  // Debug useEffect to monitor step changes
  useEffect(() => {
    console.log('=== ACTIVE STEP CHANGED ===');
    console.log('New activeStep:', activeStep);
    console.log('Steps length:', steps.length);
    console.log('Is final step:', activeStep === steps.length - 1);
    
    // If somehow we go beyond the last step, reset to last step
    if (activeStep >= steps.length) {
      console.log('WARNING: ActiveStep beyond available steps, resetting to last step');
      setActiveStep(steps.length - 1);
    }
  }, [activeStep]);

  // Debug useEffect to monitor classFees changes
  useEffect(() => {
    console.log('=== CLASS FEES STATE CHANGED ===');
    console.log('New classFees:', classFees);
  }, [classFees]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image to reduce size
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if image is too large
          const maxWidth = 800;
          const maxHeight = 1000;
          
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height / width) * maxWidth;
              width = maxWidth;
            } else {
              width = (width / height) * maxHeight;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (0.7 quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(compressedBase64);
          
          console.log('Image compressed - Original size:', file.size, 'Compressed size:', compressedBase64.length);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNext = async () => {
    console.log('=== HANDLE NEXT CLICKED ===');
    console.log('Current activeStep:', activeStep);
    console.log('Total steps:', steps.length);
    
    // Validate current step before proceeding
    let isValid = true;
    const errors = {};
    
    // Only validate fields in the current step
    if (activeStep === 0) {
      console.log('Validating Step 0 - Personal Details');
      // Personal and Contact Details validation
      const fieldsToCheck = [
        'firstName', 'lastName', 'gender', 'dateOfBirth', 'phoneNumber',
        'address', 'city', 'state', 'pincode'
      ];
      
      fieldsToCheck.forEach(field => {
        if (!formik.values[field]) {
          errors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
          isValid = false;
        }
      });
      
      // Validate phone number format
      if (formik.values.phoneNumber && !/^[0-9]{10}$/.test(formik.values.phoneNumber)) {
        errors.phoneNumber = 'Phone number must be 10 digits';
        isValid = false;
      }
      
      // Validate pincode format
      if (formik.values.pincode && !/^[1-9][0-9]{5}$/.test(formik.values.pincode)) {
        errors.pincode = 'Invalid pincode';
        isValid = false;
      }
      
      formik.setErrors(errors);
    } else if (activeStep === 1) {
      console.log('Validating Step 1 - Academic Details');
      // Academic and Parent Details validation
      const fieldsToCheck = ['rollNumber', 'class', 'admissionDate', 'fatherName', 'motherName'];
      
      fieldsToCheck.forEach(field => {
        if (!formik.values[field]) {
          errors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
          isValid = false;
        }
      });
      
      formik.setErrors(errors);
    } else if (activeStep === 2) {
      console.log('Validating Step 2 - Fee Details');
      console.log('Current fee values:', formik.values.fee);
      // Fee Details validation - at least tuition fee should be set (admission fee can be 0)
      const { tuitionFee } = formik.values.fee;
      console.log('Tuition Fee:', tuitionFee);
      if (!tuitionFee || tuitionFee === 0) {
        console.log('Fee validation failed - tuition fee is required');
        errors['fee.tuitionFee'] = 'Tuition fee is required';
        isValid = false;
      } else {
        console.log('Fee validation passed');
      }
      
      formik.setErrors(errors);
    }
    
    console.log('Validation result:', isValid);
    console.log('Errors:', errors);
    
    if (isValid) {
      // Don't go beyond the last step
      if (activeStep < steps.length - 1) {
        const newStep = activeStep + 1;
        console.log('Moving to step:', newStep);
        setActiveStep(newStep);
      } else {
        console.log('Already on final step, cannot go further');
      }
    } else {
      console.log('Validation failed, staying on current step');
    }
  };

  const handleFeeChange = (field) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    
    // Get current fee values
    const currentFee = { ...formik.values.fee };
    currentFee[field] = value;
    
    // Recalculate total fee and balance (including arrears)
    const totalFee = (currentFee.admissionFee || 0) + 
                     (currentFee.tuitionFee || 0) + 
                     (currentFee.transportFee || 0) + 
                     (currentFee.otherFee || 0) + 
                     (currentFee.arrears || 0);
    const balance = totalFee - (currentFee.concession || 0) - (currentFee.paidAmount || 0);
    
    // Update all fee fields at once
    formik.setFieldValue('fee', {
      ...currentFee,
      totalFee,
      balance,
    });
  };

  const handleConcessionChange = (event) => {
    const concession = parseFloat(event.target.value) || 0;
    const totalFee = 
      (formik.values.fee.admissionFee || 0) +
      (formik.values.fee.tuitionFee || 0) +
      (formik.values.fee.transportFee || 0) +
      (formik.values.fee.otherFee || 0) +
      (formik.values.fee.arrears || 0);
    
    if (concession > totalFee) {
      formik.setFieldError('fee.concession', 'Concession cannot be more than total fee');
      return;
    }
    
    const balance = totalFee - concession - (formik.values.fee.paidAmount || 0);
    
    formik.setFieldValue('fee', {
      ...formik.values.fee,
      concession,
      balance,
    });
  };

  const renderStepContent = (step) => {
    console.log('=== RENDERING STEP ===', step);
    console.log('Formik values when rendering step:', formik.values);
    console.log('Formik errors when rendering step:', formik.errors);
    console.log('Formik isValid when rendering step:', formik.isValid);
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {/* Left Column - Personal Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} /> Personal Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="firstName"
                    name="firstName"
                    label="First Name *"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onKeyDown={handleKeyDown}
                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                    helperText={formik.touched.firstName && formik.errors.firstName}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="lastName"
                    name="lastName"
                    label="Last Name *"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onKeyDown={handleKeyDown}
                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    size="small"
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                  >
                    <InputLabel id="gender-label">Gender *</InputLabel>
                    <Select
                      labelId="gender-label"
                      id="gender"
                      name="gender"
                      value={formik.values.gender}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Gender *"
                    >
                      <MenuItem value="">Select Gender</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                    {formik.touched.gender && formik.errors.gender && (
                      <FormHelperText>{formik.errors.gender}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date of Birth *"
                      value={formik.values.dateOfBirth}
                      onChange={(date) => formik.setFieldValue('dateOfBirth', date, true)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          size: "small",
                          error: formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth),
                          helperText: formik.touched.dateOfBirth && formik.errors.dateOfBirth
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="aadharNumber"
                    name="aadharNumber"
                    label="Aadhar Number"
                    value={formik.values.aadharNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.aadharNumber && Boolean(formik.errors.aadharNumber)}
                    helperText={formik.touched.aadharNumber && formik.errors.aadharNumber}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    inputProps={{ maxLength: 12 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="penNumber"
                    name="penNumber"
                    label="PEN Number"
                    value={formik.values.penNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.penNumber && Boolean(formik.errors.penNumber)}
                    helperText={formik.touched.penNumber && formik.errors.penNumber}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center' }}>
                <HomeIcon sx={{ mr: 1 }} /> Contact Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    id="address"
                    name="address"
                    label="Address *"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    id="city"
                    name="city"
                    label="City *"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.city && Boolean(formik.errors.city)}
                    helperText={formik.touched.city && formik.errors.city}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    id="state"
                    name="state"
                    label="State *"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.state && Boolean(formik.errors.state)}
                    helperText={formik.touched.state && formik.errors.state}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    id="pincode"
                    name="pincode"
                    label="Pincode *"
                    value={formik.values.pincode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.pincode && Boolean(formik.errors.pincode)}
                    helperText={formik.touched.pincode && formik.errors.pincode}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    inputProps={{ maxLength: 6 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="phoneNumber"
                    name="phoneNumber"
                    label="Phone Number *"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                    helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Right Column - Photo Upload and Preview */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mt: 2,
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="student-photo-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="student-photo-upload">
                  <Box
                    sx={{
                      width: 200,
                      height: 250,
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Student"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <>
                        <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="textSecondary" align="center">
                          Click to upload photo
                          <br />
                          <span style={{ fontSize: '0.8em' }}>(Max 5MB, will be compressed)</span>
                        </Typography>
                      </>
                    )}
                  </Box>
                </label>
                
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => document.getElementById('student-photo-upload').click()}
                  sx={{ mt: 2 }}
                  startIcon={<ImageIcon />}
                >
                  {imagePreview ? 'Change Photo' : 'Upload Photo'}
                </Button>
                
                <Box sx={{ mt: 4, width: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Documents
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formik.values.hasAadhar}
                            onChange={formik.handleChange}
                            name="hasAadhar"
                            color="primary"
                          />
                        }
                        label="Aadhar Copy"
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formik.values.hasBirthCertificate}
                            onChange={formik.handleChange}
                            name="hasBirthCertificate"
                            color="primary"
                          />
                        }
                        label="Birth Certificate"
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formik.values.hasTc}
                            onChange={formik.handleChange}
                            name="hasTc"
                            color="primary"
                          />
                        }
                        label="Transfer Certificate"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1 }} /> Academic Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="rollNumber"
                    name="rollNumber"
                    label="Roll Number *"
                    value={formik.values.rollNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.rollNumber && Boolean(formik.errors.rollNumber)}
                    helperText={formik.touched.rollNumber && formik.errors.rollNumber}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    size="small"
                    error={formik.touched.class && Boolean(formik.errors.class)}
                  >
                    <InputLabel id="class-label">Class *</InputLabel>
                    <Select
                      labelId="class-label"
                      id="class"
                      name="class"
                      value={formik.values.class}
                      onChange={handleClassChange}
                      onBlur={formik.handleBlur}
                      label="Class *"
                    >
                      <MenuItem value="">Select Class</MenuItem>
                      {classes.map((cls) => (
                        <MenuItem key={cls} value={cls}>
                          {cls}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.class && formik.errors.class && (
                      <FormHelperText>{formik.errors.class}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth margin="normal" variant="outlined" size="small">
                    <InputLabel id="section-label">Section</InputLabel>
                    <Select
                      labelId="section-label"
                      id="section"
                      name="section"
                      value={formik.values.section}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Section"
                    >
                      <MenuItem value="">Select Section</MenuItem>
                      {sections.map((sec) => (
                        <MenuItem key={sec} value={sec}>
                          {sec}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Admission Date *"
                      value={formik.values.admissionDate}
                      onChange={(date) => formik.setFieldValue('admissionDate', date, true)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          margin: "normal",
                          variant: "outlined",
                          size: "small",
                          error: formik.touched.admissionDate && Boolean(formik.errors.admissionDate),
                          helperText: formik.touched.admissionDate && formik.errors.admissionDate
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Parent/Guardian Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="fatherName"
                    name="fatherName"
                    label="Father's Name *"
                    value={formik.values.fatherName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}
                    helperText={formik.touched.fatherName && formik.errors.fatherName}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="fatherOccupation"
                    name="fatherOccupation"
                    label="Father's Occupation"
                    value={formik.values.fatherOccupation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="fatherPhone"
                    name="fatherPhone"
                    label="Father's Phone"
                    value={formik.values.fatherPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.fatherPhone && Boolean(formik.errors.fatherPhone)}
                    helperText={formik.touched.fatherPhone && formik.errors.fatherPhone}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="fatherAadhar"
                    name="fatherAadhar"
                    label="Father's Aadhar Number"
                    value={formik.values.fatherAadhar}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.fatherAadhar && Boolean(formik.errors.fatherAadhar)}
                    helperText={formik.touched.fatherAadhar && formik.errors.fatherAadhar}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    inputProps={{ maxLength: 12 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="motherName"
                    name="motherName"
                    label="Mother's Name *"
                    value={formik.values.motherName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.motherName && Boolean(formik.errors.motherName)}
                    helperText={formik.touched.motherName && formik.errors.motherName}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="motherOccupation"
                    name="motherOccupation"
                    label="Mother's Occupation"
                    value={formik.values.motherOccupation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="motherPhone"
                    name="motherPhone"
                    label="Mother's Phone"
                    value={formik.values.motherPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.motherPhone && Boolean(formik.errors.motherPhone)}
                    helperText={formik.touched.motherPhone && formik.errors.motherPhone}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="motherAadhar"
                    name="motherAadhar"
                    label="Mother's Aadhar Number"
                    value={formik.values.motherAadhar}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.motherAadhar && Boolean(formik.errors.motherAadhar)}
                    helperText={formik.touched.motherAadhar && formik.errors.motherAadhar}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    inputProps={{ maxLength: 12 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Guardian Details (If different from parents)
                    </Typography>
                  </Divider>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="guardianName"
                    name="guardianName"
                    label="Guardian's Name"
                    value={formik.values.guardianName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="guardianRelation"
                    name="guardianRelation"
                    label="Relation with Student"
                    value={formik.values.guardianRelation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="guardianPhone"
                    name="guardianPhone"
                    label="Guardian's Phone"
                    value={formik.values.guardianPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.guardianPhone && Boolean(formik.errors.guardianPhone)}
                    helperText={formik.touched.guardianPhone && formik.errors.guardianPhone}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ mr: 1 }} /> Bank Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    label="Bank Account Number"
                    value={formik.values.bankAccountNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="bankName"
                    name="bankName"
                    label="Bank Name"
                    value={formik.values.bankName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="ifscCode"
                    name="ifscCode"
                    label="IFSC Code"
                    value={formik.values.ifscCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    id="accountHolderName"
                    name="accountHolderName"
                    label="Account Holder Name"
                    value={formik.values.accountHolderName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ mr: 1 }} /> Fee Structure
              </Typography>
              
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>STEP 3 - FEE DETAILS:</strong> You must enter at least Admission Fee OR Tuition Fee before saving the student.
              </Alert>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="admissionFee"
                    name="fee.admissionFee"
                    label="Admission Fee (₹) *"
                    type="number"
                    value={formik.values.fee.admissionFee || ''}
                    onChange={handleFeeChange('admissionFee')}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="tuitionFee"
                    name="fee.tuitionFee"
                    label="Tuition Fee (₹) *"
                    type="number"
                    value={formik.values.fee.tuitionFee || ''}
                    onChange={handleFeeChange('tuitionFee')}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="transportFee"
                    name="fee.transportFee"
                    label="Transport Fee (₹)"
                    type="number"
                    value={formik.values.fee.transportFee || ''}
                    onChange={handleFeeChange('transportFee')}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="otherFee"
                    name="fee.otherFee"
                    label="Other Fee (₹)"
                    type="number"
                    value={formik.values.fee.otherFee || ''}
                    onChange={handleFeeChange('otherFee')}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="arrears"
                    name="fee.arrears"
                    label="Arrears (Previous Year Pending) (₹)"
                    type="number"
                    value={formik.values.fee.arrears || ''}
                    onChange={handleFeeChange('arrears')}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    helperText="Previous year pending fees"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="concession"
                    name="fee.concession"
                    label="Concession (₹)"
                    type="number"
                    value={formik.values.fee.concession || ''}
                    onChange={handleConcessionChange}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    error={Boolean(
                      formik.touched.fee?.concession &&
                        formik.errors.fee?.concession
                    )}
                    helperText={
                      formik.touched.fee?.concession && formik.errors.fee?.concession
                    }
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="paidAmount"
                    name="fee.paidAmount"
                    label="Paid Amount (₹)"
                    type="number"
                    value={formik.values.fee.paidAmount || ''}
                    onChange={(e) => {
                      const paidAmount = parseFloat(e.target.value) || 0;
                      const totalFee =
                        (formik.values.fee.admissionFee || 0) +
                        (formik.values.fee.tuitionFee || 0) +
                        (formik.values.fee.transportFee || 0) +
                        (formik.values.fee.otherFee || 0) +
                        (formik.values.fee.arrears || 0);
                      const balance = totalFee - (formik.values.fee.concession || 0) - paidAmount;
                      
                      // Check for overpayment and show warning
                      if (balance < 0) {
                        setError(`Overpayment detected: ₹${Math.abs(balance).toLocaleString('en-IN')} extra paid. Please adjust the amount.`);
                      } else {
                        setError(''); // Clear any previous overpayment error
                      }
                      
                      formik.setValues({
                        ...formik.values,
                        fee: {
                          ...formik.values.fee,
                          paidAmount,
                          balance,
                        },
                      });
                    }}
                    onBlur={formik.handleBlur}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="totalFee"
                    label="Total Fee (₹)"
                    value={(
                      (formik.values.fee.admissionFee || 0) +
                      (formik.values.fee.tuitionFee || 0) +
                      (formik.values.fee.transportFee || 0) +
                      (formik.values.fee.otherFee || 0)
                    ).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    InputProps={{
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="balance"
                    label="Balance (₹)"
                    value={Math.abs(formik.values.fee.balance || 0).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    InputProps={{
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: formik.values.fee.balance > 0 ? 'warning.main' : 'success.main',
                        },
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color={formik.values.fee.balance > 0 ? 'warning.main' : 'success.main'}
                    sx={{ ml: 1 }}
                  >
                    {formik.values.fee.balance > 0
                      ? 'Amount to be paid'
                      : formik.values.fee.balance < 0
                      ? 'Excess amount paid'
                      : 'No balance due'}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Additional Notes
                    </Typography>
                    <TextField
                      fullWidth
                      id="notes"
                      name="notes"
                      multiline
                      rows={3}
                      placeholder="Any additional notes or special instructions..."
                      value={formik.values.notes || ''}
                      onChange={formik.handleChange}
                      margin="normal"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Fee Summary
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Admission Fee:</Typography>
                    <Typography variant="body2">
                      ₹{Number(formik.values.fee.admissionFee || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tuition Fee:</Typography>
                    <Typography variant="body2">
                      ₹{Number(formik.values.fee.tuitionFee || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Transport Fee:</Typography>
                    <Typography variant="body2">
                      ₹{Number(formik.values.fee.transportFee || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Other Fee:</Typography>
                    <Typography variant="body2">
                      ₹{Number(formik.values.fee.otherFee || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontWeight: 'bold' }}>
                    <Typography variant="subtitle1">Total Fee:</Typography>
                    <Typography variant="subtitle1">
                      ₹{
                        (
                          (formik.values.fee.admissionFee || 0) +
                          (formik.values.fee.tuitionFee || 0) +
                          (formik.values.fee.transportFee || 0) +
                          (formik.values.fee.otherFee || 0)
                        ).toLocaleString('en-IN')
                      }
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Less: Concession:</Typography>
                    <Typography variant="body2" color="error">
                      - ₹{Number(formik.values.fee.concession || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Paid Amount:</Typography>
                    <Typography variant="body2" color="success.main">
                      - ₹{Number(formik.values.fee.paidAmount || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 1,
                      backgroundColor: formik.values.fee.balance > 0 ? 'warning.light' : 'success.light',
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      sx={{ fontWeight: 'bold' }}
                    >
                      {formik.values.fee.balance > 0 ? 'Balance Due:' : 'Advance:'}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ fontWeight: 'bold' }}
                      color={formik.values.fee.balance > 0 ? 'warning.dark' : 'success.dark'}
                    >
                      ₹{Math.abs(formik.values.fee.balance || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Payment Instructions
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    • Please ensure all fee payments are made before the 10th of every month.
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    • Late payments may attract a fine of ₹50 per day.
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • For any fee-related queries, please contact the school office.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/students')}
            color="primary"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Student' : 'Add New Student'}
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form 
          onSubmit={(e) => {
            console.log('=== FORM onSubmit EVENT TRIGGERED ===');
            console.log('Event type:', e.type);
            console.log('Event target:', e.target);
            console.log('Event target type:', e.target.type);
            console.log('Event target tagName:', e.target.tagName);
            console.log('Active step when form submitted:', activeStep);
            console.log('Form should only submit on step 2, currently on step:', activeStep);
            
            // ALWAYS prevent default form submission behavior
            e.preventDefault();
            
            // Only allow submission if we're on the final step AND it's from the submit button
            if (activeStep === 2 && e.target.type === 'submit') {
              console.log('Valid submission: Final step + Submit button clicked');
              formik.handleSubmit(e);
            } else {
              console.log('BLOCKED: Form submission prevented');
              console.log('Reason: activeStep =', activeStep, 'target type =', e.target.type);
              setError(`Please complete all steps and click "Save Student" button. Currently on step ${activeStep + 1} of 3.`);
            }
          }}
          onKeyDown={(e) => {
            // Prevent Enter key from submitting form unless we're on final step
            if (e.key === 'Enter' && activeStep !== 2) {
              console.log('BLOCKED: Enter key prevented form submission - not on final step');
              e.preventDefault();
            }
          }}
        >
          <Paper sx={{ p: 3, mb: 3 }}>
            {renderStepContent(activeStep)}
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="button"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            
            <Box>
              {activeStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={loading}
                  sx={{ ml: 1 }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ ml: 1 }}
                  onClick={(e) => {
                    console.log('=== SAVE STUDENT BUTTON CLICKED ===');
                    console.log('Current activeStep:', activeStep);
                    if (activeStep === 2) {
                      console.log('Calling formik.handleSubmit directly');
                      formik.handleSubmit();
                    } else {
                      console.log('Not on final step, cannot save');
                      setError('Please complete all steps before saving.');
                    }
                  }}
                >
                  {loading ? 'Saving...' : 'Save Student'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default StudentForm;
