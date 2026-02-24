const timeService = require('../services/timeService');

const addTimeHeaders = (req, res, next) => {
  const now = timeService.now();
  
  res.setHeader('X-Time-Sync', timeService.getSyncStatus().timeSource);
  res.setHeader('X-Time-Offset', timeService.timeSync.getTimeOffset());
  res.setHeader('X-Time-Accuracy', timeService.getSyncStatus().accuracy);
  res.setHeader('X-Server-Time', now.toISOString());
  res.setHeader('X-Server-Date', timeService.today());
  
  next();
};

const validateDateParams = (req, res, next) => {
  const dateParams = ['date', 'startDate', 'endDate', 'from', 'to'];
  
  for (const param of dateParams) {
    if (req.query[param]) {
      const parsed = timeService.parseDate(req.query[param]);
      if (!parsed) {
        return res.status(400).json({
          success: false,
          message: `Invalid date format for parameter: ${param}`,
          example: 'YYYY-MM-DD or DD/MM/YYYY'
        });
      }
      req.query[`${param}Parsed`] = parsed;
    }
  }
  
  next();
};

const validateAcademicDate = (req, res, next) => {
  const dateFields = ['date', 'assessmentDate', 'attendanceDate'];
  
  for (const field of dateFields) {
    if (req.body[field]) {
      const date = new Date(req.body[field]);
      if (!timeService.timeSync.isValidAcademicDate(date)) {
        return res.status(400).json({
          success: false,
          message: 'Date is outside current academic year',
          academicYear: timeService.getAcademicYear()
        });
      }
    }
  }
  
  next();
};

const getTimeStatus = (req, res) => {
  res.json({
    success: true,
    data: {
      ...timeService.getSyncStatus(),
      serverTime: timeService.now(),
      serverDate: timeService.today(),
      academicTerm: timeService.getCurrentTerm(),
      academicYear: timeService.getAcademicYear(),
      timezone: timeService.getTimezoneInfo()
    }
  });
};

module.exports = {
  addTimeHeaders,
  validateDateParams,
  validateAcademicDate,
  getTimeStatus
};