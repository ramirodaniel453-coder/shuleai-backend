const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    unique: true
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  staffNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  subjects: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  classTeacher: {
    type: DataTypes.JSONB,
    defaultValue: null
  },
  qualification: {
    type: DataTypes.STRING
  },
  specialization: {
    type: DataTypes.STRING
  },
  idNumber: {
    type: DataTypes.STRING
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other')
  },
  employmentType: {
    type: DataTypes.ENUM('permanent', 'contract', 'part-time', 'intern'),
    defaultValue: 'permanent'
  },
  dateJoined: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
    defaultValue: 'pending'
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE
  },
  rejectionReason: {
    type: DataTypes.TEXT
  },
  duties: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  dutyPreferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      preferredDays: [],
      blackoutDates: [],
      maxDutiesPerWeek: 3,
      preferredAreas: []
    }
  },
  timetable: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  reminders: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  statistics: {
    type: DataTypes.JSONB,
    defaultValue: {
      dutiesCompleted: 0,
      dutiesMissed: 0,
      averageCheckInTime: null,
      reliabilityScore: 100,
      classesTaught: 0,
      studentsCount: 0
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (teacher) => {
      if (!teacher.employeeId) {
        const year = new Date().getFullYear();
        const count = await Teacher.count();
        teacher.employeeId = `TCH-${year}-${(count + 1).toString().padStart(4, '0')}`;
      }
      
      if (!teacher.staffNumber) {
        const year = new Date().getFullYear();
        const count = await Teacher.count();
        teacher.staffNumber = `STF/${year}/${(count + 1).toString().padStart(3, '0')}`;
      }
    }
  }
});

// Get today's duty
Teacher.prototype.getTodayDuty = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.duties.find(d => {
    const dutyDate = new Date(d.date);
    dutyDate.setHours(0, 0, 0, 0);
    return dutyDate.getTime() === today.getTime();
  });
};

// Check if teaches a specific class
Teacher.prototype.teachesClass = function(className) {
  return this.subjects.some(s => s.class?.includes(className));
};

// Get all classes taught
Teacher.prototype.getClassesTaught = function() {
  const classes = new Set();
  this.subjects.forEach(s => {
    if (s.class) {
      s.class.forEach(c => classes.add(c));
    }
  });
  return Array.from(classes);
};

// Update reliability score
Teacher.prototype.updateReliabilityScore = function() {
  const total = this.statistics.dutiesCompleted + this.statistics.dutiesMissed;
  if (total === 0) return;
  
  this.statistics.reliabilityScore = Math.round(
    (this.statistics.dutiesCompleted / total) * 100
  );
};

module.exports = Teacher;