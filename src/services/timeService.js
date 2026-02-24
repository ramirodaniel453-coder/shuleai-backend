const timeSync = require('../config/timeSync');

class TimeService {
  constructor() {
    this.timeSync = timeSync;
  }

  now() {
    return this.timeSync.getCurrentTime();
  }

  today() {
    return this.timeSync.getCurrentDate();
  }

  timestamp() {
    return this.timeSync.getTimestamp();
  }

  isoString() {
    return this.timeSync.getCurrentISOString();
  }

  formatDate(date, format = 'full') {
    return this.timeSync.formatDate(date, format);
  }

  getCurrentTerm() {
    return this.timeSync.getAcademicTerm();
  }

  getAcademicYear() {
    return this.timeSync.getAcademicYear();
  }

  calculateAge(birthDate) {
    return this.timeSync.calculateAge(birthDate);
  }

  isPast(date) {
    return this.timeSync.isPast(date);
  }

  isFuture(date) {
    return this.timeSync.isFuture(date);
  }

  daysUntil(date) {
    return this.timeSync.daysUntil(date);
  }

  getSyncStatus() {
    return this.timeSync.getSyncStatus();
  }

  parseDate(dateStr) {
    if (!dateStr) return null;

    const chrono = require('chrono-node');
    
    const parsed = chrono.parseDate(dateStr);
    if (parsed) return parsed;

    const moment = require('moment');
    const formats = [
      'YYYY-MM-DD',
      'DD/MM/YYYY',
      'MM/DD/YYYY',
      'DD-MM-YYYY',
      'MM-DD-YYYY',
      'YYYY/MM/DD',
      'DD.MM.YYYY',
      'MMMM DD, YYYY',
      'DD MMM YYYY',
      'MMM DD, YYYY',
      'YYYYMMDD',
      'DDMMYYYY',
      'MMDDYYYY'
    ];
    
    for (const format of formats) {
      const parsed = moment(dateStr, format, true);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }

    const excelSerial = parseInt(dateStr);
    if (!isNaN(excelSerial) && excelSerial > 40000) {
      const excelEpoch = moment('1900-01-01');
      return excelEpoch.add(excelSerial - 2, 'days').toDate();
    }

    const timestamp = parseInt(dateStr);
    if (!isNaN(timestamp) && timestamp > 1000000000000) {
      return new Date(timestamp);
    }

    return null;
  }

  getDateRange(period, reference = null) {
    const refDate = reference ? new Date(reference) : this.now();
    const moment = require('moment');
    const m = moment(refDate);

    switch(period) {
      case 'today':
        return {
          start: m.startOf('day').toDate(),
          end: m.endOf('day').toDate()
        };
      case 'yesterday':
        return {
          start: m.subtract(1, 'day').startOf('day').toDate(),
          end: m.subtract(1, 'day').endOf('day').toDate()
        };
      case 'thisWeek':
        return {
          start: m.startOf('week').toDate(),
          end: m.endOf('week').toDate()
        };
      case 'lastWeek':
        return {
          start: m.subtract(1, 'week').startOf('week').toDate(),
          end: m.subtract(1, 'week').endOf('week').toDate()
        };
      case 'thisMonth':
        return {
          start: m.startOf('month').toDate(),
          end: m.endOf('month').toDate()
        };
      case 'lastMonth':
        return {
          start: m.subtract(1, 'month').startOf('month').toDate(),
          end: m.subtract(1, 'month').endOf('month').toDate()
        };
      case 'thisTerm':
        const term = this.getCurrentTerm();
        return {
          start: term.startDate,
          end: term.endDate
        };
      case 'thisYear':
        return {
          start: m.startOf('year').toDate(),
          end: m.endOf('year').toDate()
        };
      case 'lastYear':
        return {
          start: m.subtract(1, 'year').startOf('year').toDate(),
          end: m.subtract(1, 'year').endOf('year').toDate()
        };
      default:
        return null;
    }
  }

  isWithinRange(date, start, end) {
    const checkDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return checkDate >= startDate && checkDate <= endDate;
  }

  getTimezoneInfo() {
    const moment = require('moment-timezone');
    const timezone = moment.tz.guess();
    const offset = moment.tz(timezone).utcOffset();
    
    return {
      timezone,
      offset: offset / 60,
      name: moment.tz.zone(timezone)?.name || timezone
    };
  }

  toTimezone(date, timezone) {
    const moment = require('moment-timezone');
    return moment(date).tz(timezone).toDate();
  }

  nowInTimezone(timezone) {
    const moment = require('moment-timezone');
    return moment.tz(timezone).toDate();
  }
}

module.exports = new TimeService();