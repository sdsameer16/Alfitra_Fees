const express = require('express');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass,
  getFeeDefaulters,
  getClassFees,
  updateClassFees,
  promoteAllStudents
} = require('../controllers/students');

const Student = require('../models/Student');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Route to get class-wise fees (public for testing)
router.get('/class-fees', getClassFees);

// All routes below are protected and only accessible by authenticated users
router.use(protect);

// Route to update class-wise fees
router.put('/class-fees', updateClassFees);

// Route to promote all students
router.post('/promote-all', promoteAllStudents);

// Route to get students by class (must be before /:id)
router.get('/class/:class', getStudentsByClass);

// Route to get fee defaulters (must be before /:id)
router.get('/defaulters', getFeeDefaulters);

// Routes for all user roles
router
  .route('/')
  .get(
    advancedResults(Student, [
      { path: 'createdBy', select: 'name email' }
    ]), 
    getStudents
  )
  .post(createStudent);

router
  .route('/:id')
  .get(getStudent)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
