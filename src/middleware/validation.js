const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

const validationRules = {
  user: {
    register: [
      body('name').notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
      body('email').optional().isEmail().withMessage('Invalid email'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('role').isIn(['admin', 'teacher', 'parent', 'student']).withMessage('Invalid role'),
      body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
      body('schoolCode').notEmpty().withMessage('School code is required')
    ],
    login: [
      body('email').optional().isEmail(),
      body('password').notEmpty().withMessage('Password is required'),
      body('role').isIn(['admin', 'teacher', 'parent', 'student', 'super_admin']).withMessage('Invalid role')
    ],
    update: [
      body('name').optional().isLength({ min: 2, max: 100 }),
      body('email').optional().isEmail(),
      body('phone').optional().isMobilePhone()
    ]
  },
  
  teacherSignup: [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('schoolId').notEmpty().withMessage('School ID is required'),
    body('subjects').optional().isArray(),
    body('qualification').optional().isString()
  ],
  
  verifySchool: [
    body('schoolId').notEmpty().withMessage('School ID is required')
  ],
  
  approveTeacher: [
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    body('rejectionReason').optional().if(body('action').equals('reject')).notEmpty()
  ],
  
  dutyCheckIn: [
    body('location').optional().isString(),
    body('notes').optional().isString()
  ],
  
  student: {
    create: [
      body('name').notEmpty().withMessage('Name is required'),
      body('className').notEmpty().withMessage('Class is required'),
      body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
      body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender')
    ]
  },
  
  academic: {
    create: [
      body('studentId').notEmpty().withMessage('Student ID is required'),
      body('subject').notEmpty().withMessage('Subject is required'),
      body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
      body('term').isIn(['Term 1', 'Term 2', 'Term 3']).withMessage('Invalid term'),
      body('assessmentType').isIn(['test', 'exam', 'assignment', 'project', 'quiz', 'cat'])
    ]
  },
  
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sort').optional().isString()
  ]
};

module.exports = {
  validate,
  validationRules
};