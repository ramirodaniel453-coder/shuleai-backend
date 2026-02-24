const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DutyRoster = sequelize.define('DutyRoster', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  schoolCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: 'Schools',
      key: 'code'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  duties: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  publishedAt: {
    type: DataTypes.DATE
  },
  publishedTo: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {
      generationMethod: 'auto',
      notes: null
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['schoolCode', 'date']
    }
  ]
});

// Get duties for a specific teacher
DutyRoster.prototype.getTeacherDuties = function(teacherId) {
  return this.duties.filter(d => d.teacherId === teacherId);
};

// Check if teacher has duty on this day
DutyRoster.prototype.teacherHasDuty = function(teacherId) {
  return this.duties.some(d => d.teacherId === teacherId);
};

module.exports = DutyRoster;