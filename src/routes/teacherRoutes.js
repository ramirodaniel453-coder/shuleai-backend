const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const {
  getDashboard,
  getStudents,
  addMarks,
  getMarks,
  addAttendance,
  getAttendance,
  addComment,
  getComments,
  uploadStudentsCSV,
  uploadMarksCSV,
  uploadAttendanceCSV,
  getClassAnalytics
} = require('../controllers/teacherController');
const {
  updateDutyPreferences,
  requestDutySwap
} = require('../controllers/dutyController');

router.use(protect, authorize('teacher'));

router.get('/dashboard', getDashboard);
router.get('/class-analytics', getClassAnalytics);

router.get('/students', getStudents);
router.post('/students/upload', uploadStudentsCSV);

router.post('/marks', addMarks);
router.get('/marks', getMarks);
router.post('/marks/upload', uploadMarksCSV);

router.post('/attendance', addAttendance);
router.get('/attendance', getAttendance);
router.post('/attendance/upload', uploadAttendanceCSV);

router.post('/comments', addComment);
router.get('/comments', getComments);

router.put('/duty/preferences', updateDutyPreferences);
router.post('/duty/request-swap', requestDutySwap);

module.exports = router;