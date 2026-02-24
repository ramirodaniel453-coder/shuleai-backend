const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
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
  admissionNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  elimuid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  className: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stream: {
    type: DataTypes.STRING
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  medicalInfo: {
    type: DataTypes.JSONB,
    defaultValue: {
      bloodGroup: null,
      allergies: [],
      conditions: [],
      medications: [],
      doctorName: null,
      doctorPhone: null
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'graduated', 'transferred', 'suspended'),
    defaultValue: 'active'
  },
  academicStatus: {
    type: DataTypes.ENUM('excelling', 'average', 'struggling', 'critical'),
    defaultValue: 'average'
  },
  transport: {
    type: DataTypes.JSONB,
    defaultValue: {
      requiresTransport: false,
      route: null,
      pickupPoint: null,
      dropoffPoint: null
    }
  },
  paymentStatus: {
    type: DataTypes.JSONB,
    defaultValue: {
      plan: 'basic',
      paid: 0,
      balance: 0,
      status: 'locked',
      lastPaymentDate: null
    }
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      theme: 'light',
      notifications: true,
      language: 'en'
    }
  },
  transferHistory: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved'
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (student) => {
      if (!student.admissionNumber) {
        const year = new Date().getFullYear();
        const count = await Student.count();
        student.admissionNumber = `ADM/${year}/${(count + 1).toString().padStart(4, '0')}`;
      }
      
      if (!student.elimuid) {
        const year = new Date().getFullYear();
        const count = await Student.count();
        const sequential = (count + 1).toString().padStart(5, '0');
        student.elimuid = `STU-${year}-${sequential}`;
      }
    }
  }
});

// Virtual for full class name with stream
Student.prototype.fullClass = function() {
  return this.stream ? `${this.className} ${this.stream}` : this.className;
};

// Calculate age
Student.prototype.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Check if needs medical attention
Student.prototype.hasMedicalConditions = function() {
  return (this.medicalInfo.allergies?.length > 0 || 
          this.medicalInfo.conditions?.length > 0 ||
          this.medicalInfo.medications?.length > 0);
};

// Update payment balance
Student.prototype.updatePaymentBalance = async function() {
  const Fee = require('./Fee');
  const fees = await Fee.findAll({ where: { studentId: this.id } });
  
  this.paymentStatus.balance = fees.reduce((sum, fee) => sum + fee.balance, 0);
  await this.save();
};

module.exports = Student;