const Fee = require('../models/Fee');
const Student = require('../models/Student');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all fees
// @route   GET /api/v1/fees
// @access  Private
exports.getFees = asyncHandler(async (req, res, next) => {
  console.log('GET /api/v1/fees called');
  console.log('Advanced results:', res.advancedResults);
  res.status(200).json(res.advancedResults);
});

// @desc    Get single fee
// @route   GET /api/v1/fees/:id
// @access  Private
exports.getFee = asyncHandler(async (req, res, next) => {
  const fee = await Fee.findById(req.params.id).populate({
    path: 'student',
    select: 'firstName lastName rollNumber class'
  });

  if (!fee) {
    return next(
      new ErrorResponse(`Fee not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: fee
  });
});

// @desc    Create new fee payment
// @route   POST /api/v1/fees
// @access  Private
exports.createFee = asyncHandler(async (req, res, next) => {
  // Add user to req.body if authenticated
  if (req.user && req.user._id) {
    req.body.createdBy = req.user._id;
  }

  // Check if student exists
  const student = await Student.findById(req.body.student);
  if (!student) {
    return next(
      new ErrorResponse(`No student with the id of ${req.body.student}`, 404)
    );
  }

  // Convert single payment to items array if needed
  if (!req.body.items && req.body.amount) {
    req.body.items = [{
      category: req.body.feeType === 'tuition' ? 'Tuition' : 
                req.body.feeType === 'transport' ? 'Transport' : 
                req.body.feeType === 'admission' ? 'Admission' : 'Other',
      description: req.body.remarks || '',
      amount: parseFloat(req.body.amount)
    }];
  }

  // Calculate total amount from items
  const totalAmount = req.body.items.reduce((sum, item) => sum + item.amount, 0);
  
  // Get student's current balance (use 'fee' singular, not 'fees')
  const currentBalance = student.fee?.balance || 0;
  
  // Update the fee object with calculated values
  req.body.totalAmount = totalAmount;
  req.body.balanceAfterPayment = currentBalance - totalAmount;
  req.body.academicYear = req.body.year?.toString() || new Date().getFullYear().toString();

  const fee = await Fee.create(req.body);

  // Update student's paid amount and balance
  const totalPaid = await Fee.aggregate([
    { $match: { student: student._id } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;
  
  await Student.findByIdAndUpdate(student._id, {
    'fee.paidAmount': paidAmount,
    'fee.balance': student.fee.totalFee - paidAmount,
    'fee.lastPaymentDate': new Date()
  });

  res.status(201).json({
    success: true,
    data: fee
  });
});

// @desc    Update fee payment
// @route   PUT /api/v1/fees/:id
// @access  Private
exports.updateFee = asyncHandler(async (req, res, next) => {
  let fee = await Fee.findById(req.params.id);

  if (!fee) {
    return next(
      new ErrorResponse(`Fee not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is authorized to update this fee
  if (fee.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this fee`,
        401
      )
    );
  }

  // Calculate total amount if items are being updated
  if (req.body.items) {
    const totalAmount = req.body.items.reduce((sum, item) => sum + item.amount, 0);
    req.body.totalAmount = totalAmount;
  }

  fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // If amount was updated, update student's balance
  if (req.body.items) {
    const student = await Student.findById(fee.student);
    const totalPaid = await Fee.aggregate([
      { $match: { student: student._id } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;
    
    await Student.findByIdAndUpdate(student._id, {
      'fees.paidAmount': paidAmount,
      'fees.balance': student.fees.totalFee - paidAmount,
      'fees.lastPaymentDate': new Date()
    });
  }

  res.status(200).json({ success: true, data: fee });
});

// @desc    Delete fee payment
// @route   DELETE /api/v1/fees/:id
// @access  Private
exports.deleteFee = asyncHandler(async (req, res, next) => {
  const fee = await Fee.findById(req.params.id);

  if (!fee) {
    return next(
      new ErrorResponse(`Fee not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is authorized to delete this fee
  if (fee.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this fee`,
        401
      )
    );
  }

  const studentId = fee.student;
  
  await fee.remove();

  // Update student's paid amount and balance
  const student = await Student.findById(studentId);
  const totalPaid = await Fee.aggregate([
    { $match: { student: studentId } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;
  
  await Student.findByIdAndUpdate(studentId, {
    'fees.paidAmount': paidAmount,
    'fees.balance': student.fees.totalFee - paidAmount
  });

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get fee payment by student
// @route   GET /api/v1/fees/student/:studentId
// @access  Private
exports.getFeesByStudent = asyncHandler(async (req, res, next) => {
  const fees = await Fee.find({ student: req.params.studentId })
    .sort('-paymentDate')
    .populate({
      path: 'student',
      select: 'name rollNumber class'
    });
  
  res.status(200).json({
    success: true,
    count: fees.length,
    data: fees
  });
});

// @desc    Get fee payment by date range
// @route   GET /api/v1/fees/date-range
// @access  Private
exports.getFeesByDateRange = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return next(
      new ErrorResponse('Please provide both startDate and endDate', 400)
    );
  }

  const fees = await Fee.find({
    paymentDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).populate({
    path: 'student',
    select: 'name rollNumber class'
  });
  
  res.status(200).json({
    success: true,
    count: fees.length,
    data: fees
  });
});

// @desc    Get fee summary
// @route   GET /api/v1/fees/summary
// @access  Private
exports.getFeeSummary = asyncHandler(async (req, res, next) => {
  // Get total fees collected
  const collectedSummary = await Fee.aggregate([
    {
      $group: {
        _id: null,
        totalCollected: { $sum: '$totalAmount' },
        totalPayments: { $sum: 1 }
      }
    }
  ]);

  // Get total pending fees from students
  const pendingSummary = await Student.aggregate([
    {
      $group: {
        _id: null,
        totalPending: { $sum: '$fee.balance' },
        totalExpected: { $sum: '$fee.totalFee' }
      }
    }
  ]);
  
  const totalCollected = collectedSummary.length > 0 ? collectedSummary[0].totalCollected : 0;
  const totalPayments = collectedSummary.length > 0 ? collectedSummary[0].totalPayments : 0;
  const totalPending = pendingSummary.length > 0 ? pendingSummary[0].totalPending : 0;
  const totalExpected = pendingSummary.length > 0 ? pendingSummary[0].totalExpected : 0;
  
  res.status(200).json({
    success: true,
    data: {
      totalCollected,
      totalPayments,
      totalPending,
      totalExpected
    }
  });
});
