const express = require('express');
const {
  getFees,
  getFee,
  createFee,
  updateFee,
  deleteFee,
  getFeesByStudent,
  getFeesByDateRange,
  getFeeSummary
} = require('../controllers/fees');

const Fee = require('../models/Fee');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// All routes are protected and only accessible by authenticated users
router.use(protect);

// Routes for all user roles
router
  .route('/')
  .get(
    advancedResults(Fee, [
      { path: 'student', select: 'firstName lastName rollNumber class' },
      { path: 'createdBy', select: 'name email' }
    ]), 
    getFees
  )
  .post(createFee);

// Route to get fee summary (must be before /:id)
router.get('/summary', getFeeSummary);

// Route to get fees by date range (must be before /:id)
router.get('/date-range', getFeesByDateRange);

// Route to get fees by student (must be before /:id)
router.get('/student/:studentId', getFeesByStudent);

router
  .route('/:id')
  .get(getFee)
  .put(updateFee)
  .delete(deleteFee);

module.exports = router;
