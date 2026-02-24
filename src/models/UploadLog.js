const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UploadLog = sequelize.define('UploadLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('students', 'marks', 'attendance'),
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING
  },
  originalName: {
    type: DataTypes.STRING
  },
  fileSize: {
    type: DataTypes.INTEGER
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  schoolCode: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      processed: 0,
      created: 0,
      skipped: 0,
      errors: 0,
      elimuidsGenerated: 0
    }
  },
  dateRange: {
    type: DataTypes.JSONB
  },
  errors: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  warnings: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB
  }
}, {
  timestamps: true
});

module.exports = UploadLog;