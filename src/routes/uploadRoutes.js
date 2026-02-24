const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const {
  uploadStudents,
  uploadMarks,
  uploadAttendance,
  downloadTemplate,
  getUploadHistory,
  validateCSV
} = require('../controllers/uploadController');

router.use(protect);

router.get('/template/:type', downloadTemplate);
router.post('/validate', validateCSV);

router.post('/students', authorize('teacher', 'admin'), uploadStudents);
router.post('/marks', authorize('teacher'), uploadMarks);
router.post('/attendance', authorize('teacher'), uploadAttendance);

router.get('/history', authorize('teacher', 'admin'), getUploadHistory);

module.exports = router;