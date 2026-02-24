const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const QRCode = require('qrcode');

const School = sequelize.define('School', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  schoolId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  schoolType: {
    type: DataTypes.ENUM('primary', 'secondary'),
    allowNull: false
  },
  curriculum: {
    type: DataTypes.ENUM('844', 'cbc', 'british', 'american'),
    defaultValue: '844'
  },
  classes: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  streams: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  address: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  contact: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  motto: {
    type: DataTypes.STRING
  },
  vision: {
    type: DataTypes.TEXT
  },
  mission: {
    type: DataTypes.TEXT
  },
  established: {
    type: DataTypes.INTEGER
  },
  registrationNumber: {
    type: DataTypes.STRING
  },
  bankDetails: {
    type: DataTypes.JSONB,
    defaultValue: {
      bankName: 'Equity Bank',
      accountName: '',
      accountNumber: '',
      branch: ''
    }
  },
  feeStructure: {
    type: DataTypes.JSONB,
    defaultValue: {
      tuition: 0,
      activity: 0,
      boarding: 0,
      transport: 0,
      uniform: 0,
      other: 0
    }
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      allowTeacherSignup: true,
      requireApproval: true,
      autoApproveDomains: [],
      academicYear: '2024-2025',
      currentTerm: 'Term 1',
      dutyManagement: {
        enabled: true,
        reminderHours: 24,
        maxTeachersPerDay: 3,
        checkInWindow: 15
      },
      primarySettings: {
        hasFeedingProgram: false,
        hasDaycare: false,
        parentPickupRequired: true
      },
      secondarySettings: {
        hasBoarding: false,
        hasLaboratories: true,
        hasLibrary: true,
        hasSports: true
      }
    }
  },
  qrCode: {
    type: DataTypes.TEXT
  },
  qrCodeData: {
    type: DataTypes.JSONB
  },
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      students: 0,
      teachers: 0,
      parents: 0,
      classes: 0,
      streams: 0,
      pendingApprovals: 0,
      feesCollected: 0
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (school) => {
      if (!school.schoolId) {
        const year = new Date().getFullYear();
        const count = await School.count();
        const sequential = (count + 1).toString().padStart(5, '0');
        
        const typePrefix = school.schoolType === 'primary' ? 'PRI' : 'SEC';
        school.schoolId = `${typePrefix}-${year}-${sequential}`;
        school.code = school.schoolId;
        
        // Set default classes
        if (!school.classes || school.classes.length === 0) {
          if (school.schoolType === 'primary') {
            school.classes = [
              'PP1', 'PP2', 
              'Grade 1', 'Grade 2', 'Grade 3', 
              'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'
            ];
          } else {
            school.classes = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
          }
        }
        
        // Generate QR code
        try {
          const qrData = {
            schoolId: school.schoolId,
            name: school.name,
            type: school.schoolType,
            createdAt: new Date()
          };
          school.qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
          school.qrCodeData = {
            generated: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            active: true
          };
        } catch (err) {
          console.error('QR Code generation failed:', err);
        }
      }
    }
  }
});

// Instance methods
School.prototype.validateAccessCode = function(code) {
  return code === this.schoolId;
};

School.prototype.getStreamsForClass = function(className) {
  return this.streams.filter(s => s.class === className);
};

School.prototype.updateStats = async function() {
  const Student = require('./Student');
  const Teacher = require('./Teacher');
  const Parent = require('./Parent');
  
  this.stats.students = await Student.count({ where: { schoolCode: this.code } });
  this.stats.teachers = await Teacher.count({ 
    include: [{
      model: User,
      where: { schoolCode: this.code }
    }]
  });
  this.stats.parents = await Parent.count({ 
    include: [{
      model: User,
      where: { schoolCode: this.code }
    }]
  });
  this.stats.classes = this.classes.length;
  this.stats.streams = this.streams.length;
  
  await this.save();
};

module.exports = School;