const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SchoolNameRequest = sequelize.define('SchoolNameRequest', {
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
  currentName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  newName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  requestedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reviewedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE
  },
  rejectionReason: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});

module.exports = SchoolNameRequest;