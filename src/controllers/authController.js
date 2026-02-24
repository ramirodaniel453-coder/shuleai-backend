const { User, School, Student, Teacher, Parent, Admin, Alert } = require('../models');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const timeService = require('../services/timeService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, phone, schoolCode } = req.body;

    // Check if school exists
    const school = await School.findOne({ where: { code: schoolCode } });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Check if user already exists
    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      schoolCode
    });

    let profile = null;

    // Create role-specific profile
    switch (role) {
      case 'student':
        profile = await Student.create({
          userId: user.id,
          className: req.body.className || 'Not Assigned',
          dateOfBirth: req.body.dateOfBirth || new Date(),
          gender: req.body.gender || 'other'
        });
        break;

      case 'teacher':
        profile = await Teacher.create({
          userId: user.id,
          subjects: req.body.subjects || []
        });
        break;

      case 'parent':
        profile = await Parent.create({
          userId: user.id
        });
        break;

      case 'admin':
        profile = await Admin.create({
          userId: user.id
        });
        break;
    }

    // Generate token
    const token = user.generateAuthToken();

    // Send welcome email
    if (email) {
      await sendEmail({
        to: email,
        subject: 'Welcome to ShuleAI',
        template: 'welcome',
        data: { name, role, schoolName: school.name }
      });
    }

    // Create welcome alert
    await Alert.create({
      userId: user.id,
      role,
      type: 'system',
      severity: 'success',
      title: 'Welcome to ShuleAI!',
      message: `Your account has been created successfully. Welcome to ${school.name}!`
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: user.getPublicProfile(),
        profile
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, role } = req.body;

    let user;

    if (role === 'super_admin') {
      if (password === process.env.SUPER_ADMIN_KEY) {
        user = await User.findOne({ where: { role: 'super_admin' } });
        if (!user) {
          user = await User.create({
            name: 'Super Admin',
            email: process.env.SUPER_ADMIN_EMAIL || 'super@shuleai.com',
            password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!',
            role: 'super_admin',
            schoolCode: 'GLOBAL'
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } else {
      user = await User.findOne({ 
        where: { email, role },
        attributes: { include: ['password'] }
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    user.lastLogin = timeService.now();
    await user.save();

    let profile = null;
    switch (user.role) {
      case 'student':
        profile = await Student.findOne({ where: { userId: user.id } });
        break;
      case 'teacher':
        profile = await Teacher.findOne({ where: { userId: user.id } });
        break;
      case 'parent':
        profile = await Parent.findOne({ where: { userId: user.id } });
        break;
      case 'admin':
        profile = await Admin.findOne({ where: { userId: user.id } });
        break;
    }

    const school = await School.findOne({ where: { code: user.schoolCode } });

    const token = user.generateAuthToken();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    await Alert.create({
      userId: user.id,
      role: user.role,
      type: 'system',
      severity: 'info',
      title: 'New Login',
      message: `You logged in at ${timeService.formatDate(new Date(), 'full')}`
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.getPublicProfile(),
        profile,
        school: school ? {
          name: school.name,
          code: school.code,
          curriculum: school.curriculum
        } : null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000)
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    let profile = null;
    switch (user.role) {
      case 'student':
        profile = await Student.findOne({ where: { userId: user.id } });
        break;
      case 'teacher':
        profile = await Teacher.findOne({ where: { userId: user.id } });
        break;
      case 'parent':
        profile = await Parent.findOne({ where: { userId: user.id } });
        break;
      case 'admin':
        profile = await Admin.findOne({ where: { userId: user.id } });
        break;
    }

    const school = await School.findOne({ where: { code: user.schoolCode } });

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        profile,
        school
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        name: user.name,
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send reset email',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Successful',
      template: 'password-reset-success',
      data: { name: user.name }
    });

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id, {
      attributes: { include: ['password'] }
    });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword
};