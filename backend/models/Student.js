const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Personal Details
  firstName: {
    type: String,
    required: [true, 'Please add first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please add last name'],
    trim: true
  },
  gender: {
    type: String,
    required: [true, 'Please select gender'],
    enum: ['Male', 'Female', 'Other']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth']
  },
  bloodGroup: {
    type: String,
    trim: true
  },
  aadharNumber: {
    type: String,
    trim: true
  },
  penNumber: {
    type: String,
    trim: true
  },
  
  // Contact Details
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please add phone number'],
    trim: true
  },
  phoneNumber2: {
    type: String,
    trim: true
  },
  
  // Address
  address: {
    type: String,
    required: [true, 'Please add address']
  },
  city: {
    type: String,
    required: [true, 'Please add city']
  },
  state: {
    type: String,
    required: [true, 'Please add state']
  },
  pincode: {
    type: String,
    required: [true, 'Please add pincode']
  },
  
  // Academic Details
  rollNumber: {
    type: String,
    required: [true, 'Please add roll number'],
    unique: true,
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Please add class']
  },
  section: {
    type: String,
    trim: true
  },
  admissionDate: {
    type: Date,
    required: [true, 'Please add admission date']
  },
  
  // Parent/Guardian Details
  fatherName: {
    type: String,
    required: [true, "Please add father's name"]
  },
  fatherOccupation: {
    type: String,
    trim: true
  },
  fatherPhone: {
    type: String,
    trim: true
  },
  fatherAadhar: {
    type: String,
    trim: true
  },
  motherName: {
    type: String,
    required: [true, "Please add mother's name"]
  },
  motherOccupation: {
    type: String,
    trim: true
  },
  motherPhone: {
    type: String,
    trim: true
  },
  motherAadhar: {
    type: String,
    trim: true
  },
  guardianName: {
    type: String,
    trim: true
  },
  guardianRelation: {
    type: String,
    trim: true
  },
  guardianPhone: {
    type: String,
    trim: true
  },
  
  // Fee Details
  fee: {
    admissionFee: { type: Number, default: 0 },
    tuitionFee: { type: Number, default: 0 },
    transportFee: { type: Number, default: 0 },
    otherFee: { type: Number, default: 0 },
    arrears: { type: Number, default: 0 }, // Previous year pending fees
    concession: { type: Number, default: 0 },
    totalFee: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    lastPaymentDate: { type: Date }
  },
  
  // Bank Details
  bankAccountNumber: {
    type: String,
    trim: true
  },
  bankName: {
    type: String,
    trim: true
  },
  ifscCode: {
    type: String,
    trim: true
  },
  accountHolderName: {
    type: String,
    trim: true
  },
  
  // Documents
  hasAadhar: { type: Boolean, default: false },
  hasBirthCertificate: { type: Boolean, default: false },
  hasTc: { type: Boolean, default: false },
  hasPhoto: { type: Boolean, default: false },
  photo: { type: String },
  
  // System Fields
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'transferred'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total fee before saving
studentSchema.pre('save', function() {
  if (this.fee) {
    this.fee.totalFee = (this.fee.admissionFee || 0) + 
                        (this.fee.tuitionFee || 0) + 
                        (this.fee.transportFee || 0) +
                        (this.fee.otherFee || 0);
    this.fee.balance = this.fee.totalFee - (this.fee.concession || 0) - (this.fee.paidAmount || 0);
  }
});

module.exports = mongoose.model('Student', studentSchema);
