const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const {
  getTodayDuty,
  getWeeklyDuty,
  checkInDuty,
  checkOutDuty
} = require('../controllers/dutyController');

router.use(protect);

router.get('/today', getTodayDuty);
router.get('/week', getWeeklyDuty);

router.post('/check-in', authorize('teacher'), checkInDuty);
router.post('/check-out', authorize('teacher'), checkOutDuty);

module.exports = router;