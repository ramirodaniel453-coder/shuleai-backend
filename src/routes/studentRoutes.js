const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const {
  getDashboard,
  getGrades,
  getAttendance,
  getTimetable,
  getMaterials,
  getReminders,
  setReminder,
  updateProfile,
  changeTheme
} = require('../controllers/studentController');

// All routes require student access
router.use(protect, authorize('student'));

// Dashboard
router.get('/dashboard', getDashboard);
router.get('/grades', getGrades);
router.get('/attendance', getAttendance);
router.get('/timetable', getTimetable);

// Learning materials
router.get('/materials', getMaterials);

// Reminders
router.get('/reminders', getReminders);
router.post('/reminders', setReminder);

// Profile
router.put('/profile', updateProfile);
router.put('/theme', changeTheme);

module.exports = router;