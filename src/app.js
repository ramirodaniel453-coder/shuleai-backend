const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

require('dotenv').config();

const { sequelize } = require('./config/database');
const { addTimeHeaders, validateDateParams, getTimeStatus } = require('./middleware/timeSync');
const timeService = require('./services/timeService');
const routes = require('./routes');
const logger = require('./utils/logger');

// Initialize express
const app = express();

// Database connection pool for sessions
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Time headers
app.use(addTimeHeaders);
app.use(validateDateParams);

// File upload
app.use(fileUpload({
  limits: { fileSize: process.env.MAX_FILE_SIZE || 50 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Session configuration with PostgreSQL store
app.use(session({
  store: new pgSession({
    pool: pgPool,
    tableName: 'sessions'
  }),
  secret: process.env.SESSION_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// Create uploads directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Static files
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api', routes);

// Time sync status
app.get('/api/time/status', getTimeStatus);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: timeService.isoString(),
    serverTime: timeService.formatDate(timeService.now(), 'full'),
    serverDate: timeService.today(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    timeSync: timeService.getSyncStatus(),
    academicTerm: timeService.getCurrentTerm(),
    academicYear: timeService.getAcademicYear(),
    database: sequelize.authenticate() ? 'connected' : 'disconnected'
  });
});

// API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'ShuleAI API',
    version: '2.1.0',
    description: 'Complete School Intelligence System for Individual Schools',
    currentTime: timeService.formatDate(timeService.now(), 'full'),
    endpoints: {
      auth: '/api/auth',
      school: '/api/school',
      admin: '/api/admin',
      teacher: '/api/teacher',
      parent: '/api/parent',
      student: '/api/student',
      duty: '/api/duty',
      upload: '/api/upload',
      analytics: '/api/analytics',
      public: '/api/public',
      time: '/api/time/status',
      health: '/health'
    },
    status: 'operational'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: timeService.isoString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.errors.map(e => e.message),
      timestamp: timeService.isoString()
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      field: err.errors[0]?.path,
      timestamp: timeService.isoString()
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      timestamp: timeService.isoString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      timestamp: timeService.isoString()
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large',
      timestamp: timeService.isoString()
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: timeService.isoString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;