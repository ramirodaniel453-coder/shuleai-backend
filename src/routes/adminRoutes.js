const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const {
  getPendingApprovals,
  approveTeacher,
  getApprovalStats
} = require('../controllers/teacherSignupController');
const {
  generateDutyRoster,
  getDutyStats
} = require('../controllers/dutyController');
const {
  getTeacherManagement,
  addTeacher,
  updateTeacher,
  removeTeacher
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/approvals/pending', getPendingApprovals);
router.get('/approvals/stats', getApprovalStats);
router.post('/teachers/:teacherId/approve', approveTeacher);

router.get('/teachers', getTeacherManagement);
router.post('/teachers', addTeacher);
router.put('/teachers/:teacherId', updateTeacher);
router.delete('/teachers/:teacherId', removeTeacher);

router.post('/duty/generate', generateDutyRoster);
router.get('/duty/stats', getDutyStats);

module.exports = router;