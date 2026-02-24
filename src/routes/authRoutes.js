const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword
} = require('../controllers/authController');
const {
  teacherSignup,
  verifySchoolId
} = require('../controllers/teacherSignupController');

router.post('/register', validationRules.user.register, validate, register);
router.post('/login', validationRules.user.login, validate, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/teacher/signup', teacherSignup);
router.post('/verify-school', verifySchoolId);

router.use(protect);
router.get('/me', getMe);
router.post('/logout', logout);
router.post('/change-password', changePassword);

module.exports = router;