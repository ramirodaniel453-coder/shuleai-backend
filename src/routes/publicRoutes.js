const express = require('express');
const router = express.Router();
const {
  getPublicDutyView,
  getPublicWeeklyDuty,
  getSchoolInfo
} = require('../controllers/publicController');

router.get('/duty/today', getPublicDutyView);
router.get('/duty/week', getPublicWeeklyDuty);
router.get('/school/:schoolId', getSchoolInfo);

module.exports = router;