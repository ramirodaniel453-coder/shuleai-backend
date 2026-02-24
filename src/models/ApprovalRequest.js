const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApprovalRequest = sequelize.define('ApprovalRequest', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('teacher', 'parent', 'student'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {}
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
  },
  notes: {
    type: DataTypes.TEXT
  },
  metadata: {
    type: DataTypes.JSONB
  },
  expiresAt: {
    type: DataTypes.DATE,
    defaultValue: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true
});

module.exports = ApprovalRequest;