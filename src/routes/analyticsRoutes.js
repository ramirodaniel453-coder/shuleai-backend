const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const {
  getStudentAnalytics,
  getClassAnalytics,
  getSchoolAnalytics,
  compareCurriculum
} = require('../controllers/analyticsController');

router.use(protect);

router.get('/student/:studentId', getStudentAnalytics);
router.get('/class/:classId', authorize('teacher', 'admin'), getClassAnalytics);
router.get('/school', authorize('admin'), getSchoolAnalytics);
router.get('/compare/:studentId', compareCurriculum);

module.exports = router;