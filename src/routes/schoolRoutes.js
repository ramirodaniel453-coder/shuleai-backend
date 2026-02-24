const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const {
  getSchoolInfo,
  updateSchool,
  getClasses,
  getStreams,
  updateFeeStructure,
  getSchoolStats,
  requestNameChange
} = require('../controllers/schoolController');

router.use(protect);

router.get('/info', getSchoolInfo);
router.get('/classes', getClasses);
router.get('/streams', getStreams);
router.get('/stats', getSchoolStats);

router.put('/update', authorize('admin'), updateSchool);
router.put('/fee-structure', authorize('admin'), updateFeeStructure);
router.post('/request-name-change', authorize('admin'), requestNameChange);

module.exports = router;