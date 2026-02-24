const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const schoolRoutes = require('./schoolRoutes');
const adminRoutes = require('./adminRoutes');
const teacherRoutes = require('./teacherRoutes');
const parentRoutes = require('./parentRoutes');
const studentRoutes = require('./studentRoutes');
const dutyRoutes = require('./dutyRoutes');
const uploadRoutes = require('./uploadRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const publicRoutes = require('./publicRoutes');

router.use('/auth', authRoutes);
router.use('/school', schoolRoutes);
router.use('/admin', adminRoutes);
router.use('/teacher', teacherRoutes);
router.use('/parent', parentRoutes);
router.use('/student', studentRoutes);
router.use('/duty', dutyRoutes);
router.use('/upload', uploadRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/public', publicRoutes);

module.exports = router;