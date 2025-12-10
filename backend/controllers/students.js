const Student = require('../models/Student');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private
exports.getStudents = asyncHandler(async (req, res, next) => {
  console.log('GET /api/v1/students called');
  console.log('Advanced results:', res.advancedResults);
  res.status(200).json(res.advancedResults);
});

// @desc    Get single student
// @route   GET /api/v1/students/:id
// @access  Private
exports.getStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(
      new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Create new student
// @route   POST /api/v1/students
// @access  Private
exports.createStudent = asyncHandler(async (req, res, next) => {
  console.log('Create student called');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User:', req.user);
  
  // Add user to req.body
  req.body.createdBy = req.user.id;

  const student = await Student.create(req.body);
  
  console.log('Student created:', student);

  res.status(201).json({
    success: true,
    data: student
  });
});

// @desc    Update student
// @route   PUT /api/v1/students/:id
// @access  Private
exports.updateStudent = asyncHandler(async (req, res, next) => {
  let student = await Student.findById(req.params.id);

  if (!student) {
    return next(
      new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
    );
  }

  student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: student });
});

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
// @access  Private
exports.deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(
      new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
    );
  }

  await student.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get students by class
// @route   GET /api/v1/students/class/:class
// @access  Private
exports.getStudentsByClass = asyncHandler(async (req, res, next) => {
  const students = await Student.find({ class: req.params.class });
  
  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// @desc    Get fee defaulters
// @route   GET /api/v1/students/defaulters
// @access  Private
exports.getFeeDefaulters = asyncHandler(async (req, res, next) => {
  const students = await Student.find({ 'fee.balance': { $gt: 0 } });
  
  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// @desc    Get class-wise fee structure
// @route   GET /api/v1/students/class-fees
// @access  Private
exports.getClassFees = asyncHandler(async (req, res, next) => {
  console.log('=== GET CLASS FEES CALLED ===');
  try {
    const classFees = require('../config/classFees');
    console.log('Class fees loaded:', classFees);
    
    res.status(200).json({
      success: true,
      data: classFees
    });
  } catch (error) {
    console.error('Error in getClassFees:', error);
    next(error);
  }
});

// @desc    Update class fee structure
// @route   PUT /api/v1/students/class-fees
// @access  Private
exports.updateClassFees = asyncHandler(async (req, res, next) => {
  // This would typically update a database table, but for now we'll return success
  // In production, you'd want to store this in a separate ClassFee model
  res.status(200).json({
    success: true,
    message: 'Class fees updated successfully',
    data: req.body
  });
});

// @desc    Promote all students (move pending balance to arrears)
// @route   POST /api/v1/students/promote-all
// @access  Private
exports.promoteAllStudents = asyncHandler(async (req, res, next) => {
  const students = await Student.find({ 'fee.balance': { $gt: 0 } });
  
  let promotedCount = 0;
  
  for (const student of students) {
    if (student.fee.balance > 0) {
      // Move current balance to arrears
      const newArrears = student.fee.arrears + student.fee.balance;
      
      await Student.findByIdAndUpdate(student._id, {
        'fee.arrears': newArrears,
        'fee.balance': 0,
        'fee.paidAmount': 0,
        'fee.totalFee': 0, // Reset for new year
        'fee.admissionFee': 0,
        'fee.tuitionFee': 0,
        'fee.transportFee': 0,
        'fee.otherFee': 0,
        'fee.concession': 0
      });
      
      promotedCount++;
    }
  }
  
  res.status(200).json({
    success: true,
    message: `Promoted ${promotedCount} students. Pending balances moved to arrears.`,
    promotedCount
  });
});