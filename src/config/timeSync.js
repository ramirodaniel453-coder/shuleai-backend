const ntpClient = require('ntp-client');
const cron = require('node-cron');

class TimeSynchronizer {
  constructor() {
    this.ntpServers = [
      'pool.ntp.org',
      'time.google.com',
      'time.windows.com',
      'time.apple.com',
      'time.cloudflare.com'
    ];
    this.currentTimeOffset = 0;
    this.lastSyncTime = null;
    this.syncInterval = 3600000;
    this.isSyncing = false;
    this.timeSource = 'system';
    this.accuracy = 'high';
    this.syncHistory = [];
  }

  async init() {
    console.log('⏰ Initializing network time synchronization...');
    await this.syncWithNetwork();
    
    cron.schedule('0 * * * *', async () => {
      await this.syncWithNetwork();
    });
    
    setInterval(async () => {
      await this.syncWithNetwork();
    }, 6 * 60 * 60 * 1000);
    
    console.log('✅ Time synchronization active');
  }

  async syncWithNetwork() {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    console.log('🔄 Syncing time with NTP servers...');

    for (const server of this.ntpServers) {
      try {
        const ntpTime = await this.getNTPTime(server);
        if (ntpTime) {
          const systemTime = Date.now();
          this.currentTimeOffset = ntpTime - systemTime;
          this.lastSyncTime = new Date();
          this.timeSource = 'ntp';
          this.accuracy = Math.abs(this.currentTimeOffset) < 100 ? 'high' : 'medium';
          
          this.syncHistory.push({
            server,
            timestamp: new Date(),
            offset: this.currentTimeOffset,
            accuracy: this.accuracy
          });
          
          if (this.syncHistory.length > 100) {
            this.syncHistory.shift();
          }
          
          console.log(`✅ Time synced with ${server} (offset: ${this.currentTimeOffset}ms, accuracy: ${this.accuracy})`);
          this.isSyncing = false;
          return true;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to sync with ${server}:`, error.message);
      }
    }

    console.warn('⚠️ Using system time - no NTP servers reachable');
    this.timeSource = 'system';
    this.accuracy = 'low';
    this.isSyncing = false;
    return false;
  }

  getNTPTime(server) {
    return new Promise((resolve, reject) => {
      ntpClient.getNetworkTime(server, 123, (err, date) => {
        if (err) {
          reject(err);
        } else {
          resolve(date.getTime());
        }
      });
    });
  }

  getCurrentTime() {
    const systemTime = Date.now();
    return new Date(systemTime + this.currentTimeOffset);
  }

  getCurrentDate() {
    const now = this.getCurrentTime();
    return now.toISOString().split('T')[0];
  }

  getCurrentTimeString() {
    const now = this.getCurrentTime();
    return now.toTimeString().split(' ')[0];
  }

  getCurrentISOString() {
    return this.getCurrentTime().toISOString();
  }

  getTimeOffset() {
    return this.currentTimeOffset;
  }

  getSyncStatus() {
    return {
      timeSource: this.timeSource,
      accuracy: this.accuracy,
      lastSync: this.lastSyncTime,
      offset: this.currentTimeOffset,
      isSyncing: this.isSyncing
    };
  }

  getSyncHistory(limit = 10) {
    return this.syncHistory.slice(-limit);
  }

  setManualOffset(offsetMs) {
    this.currentTimeOffset = offsetMs;
    this.lastSyncTime = new Date();
    this.timeSource = 'manual';
    this.accuracy = 'manual';
    console.log(`📅 Manual time offset set to ${offsetMs}ms`);
  }

  formatDate(date, format = 'full') {
    const d = date || this.getCurrentTime();
    
    const formats = {
      full: { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      },
      date: {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      },
      time: {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      },
      iso: null
    };

    if (format === 'iso') {
      return d.toISOString();
    }

    return d.toLocaleDateString('en-US', formats[format] || formats.full);
  }

  getAcademicTerm(date = null) {
    const currentDate = date || this.getCurrentTime();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    if (month >= 1 && month <= 4) {
      return {
        term: 'Term 1',
        year,
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 3, 30)
      };
    } else if (month >= 5 && month <= 8) {
      return {
        term: 'Term 2',
        year,
        startDate: new Date(year, 4, 1),
        endDate: new Date(year, 7, 31)
      };
    } else {
      return {
        term: 'Term 3',
        year,
        startDate: new Date(year, 8, 1),
        endDate: new Date(year, 11, 31)
      };
    }
  }

  getAcademicYear() {
    const now = this.getCurrentTime();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    if (month >= 9) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  calculateAge(birthDate) {
    const now = this.getCurrentTime();
    const birth = new Date(birthDate);
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  isPast(date) {
    return new Date(date) < this.getCurrentTime();
  }

  isFuture(date) {
    return new Date(date) > this.getCurrentTime();
  }

  daysUntil(date) {
    const target = new Date(date);
    const now = this.getCurrentTime();
    const diffTime = target - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getTimestamp() {
    return this.getCurrentTime();
  }

  isValidAcademicDate(date) {
    const checkDate = new Date(date);
    const academicYear = this.getAcademicYear();
    const [startYear, endYear] = academicYear.split('-').map(Number);
    
    const yearStart = new Date(startYear, 8, 1);
    const yearEnd = new Date(endYear, 7, 31);
    
    return checkDate >= yearStart && checkDate <= yearEnd;
  }
}

const timeSync = new TimeSynchronizer();
module.exports = timeSync;