const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const {
  getChildren,
  getChildDashboard,
  getChildGrades,
  getChildAttendance,
  getFeeStatus,
  makePayment,
  reportAbsence,
  getPaymentHistory,
  getGuidanceTips
} = require('../controllers/parentController');

router.use(protect, authorize('parent'));

router.get('/children', getChildren);
router.get('/child/:childId/dashboard', getChildDashboard);
router.get('/child/:childId/grades', getChildGrades);
router.get('/child/:childId/attendance', getChildAttendance);

router.get('/fees', getFeeStatus);
router.post('/payments', makePayment);
router.get('/payments/history', getPaymentHistory);

router.post('/report-absence', reportAbsence);

router.get('/guidance', getGuidanceTips);

module.exports = router;