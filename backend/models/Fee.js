const mongoose = require('mongoose');
const Counter = require('./Counter');

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  receiptNumber: {
    type: String,
    unique: true
  },
  academicYear: {
    type: String,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Other'],
    default: 'Cash'
  },
  paymentDetails: {
    type: String,
    trim: true
  },
  paidBy: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    relation: {
      type: String,
      required: true,
      enum: ['Father', 'Mother', 'Guardian', 'Other']
    },
    contact: {
      type: String,
      trim: true
    }
  },
  items: [{
    category: {
      type: String,
      required: true,
      enum: ['Admission', 'Tuition', 'Books', 'Transport', 'Uniform', 'Other']
    },
    description: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  balanceAfterPayment: {
    type: Number,
    required: true
  },
  remarks: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate receipt number before saving
feeSchema.pre('save', async function() {
  if (!this.isNew) return;
  
  // Get next sequence number from counter
  const sequenceNumber = await Counter.getNextSequence('receiptNumber');
  this.receiptNumber = sequenceNumber.toString();
  
  // Calculate total amount if not provided
  if (!this.totalAmount) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
  }
});

// Update student's paid amount after saving fee
feeSchema.post('save', async function(doc) {
  const Student = mongoose.model('Student');
  
  // Calculate total paid amount for the student
  const fees = await this.constructor.find({ student: doc.student });
  const totalPaid = fees.reduce((sum, fee) => sum + fee.totalAmount, 0);
  
  // Get student to calculate balance
  const student = await Student.findById(doc.student);
  
  // Update student's paid amount and balance (use 'fee' singular, not 'fees')
  await Student.findByIdAndUpdate(doc.student, {
    'fee.paidAmount': totalPaid,
    'fee.balance': student.fee.totalFee - totalPaid,
    'fee.lastPaymentDate': new Date()
  });
});

module.exports = mongoose.model('Fee', feeSchema);
