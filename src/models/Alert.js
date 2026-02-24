const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('student', 'parent', 'teacher', 'admin'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('academic', 'attendance', 'fee', 'system', 'improvement', 'duty', 'approval'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('critical', 'warning', 'info', 'success'),
    defaultValue: 'info'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActioned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  actionUrl: {
    type: DataTypes.STRING
  },
  actionText: {
    type: DataTypes.STRING
  },
  expiresAt: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true
});

// Mark as read
Alert.prototype.markAsRead = function() {
  this.isRead = true;
};

// Mark as actioned
Alert.prototype.markAsActioned = function() {
  this.isActioned = true;
};

// Get unread alerts for user
Alert.getUnreadForUser = async function(userId) {
  return await this.findAll({
    where: { userId, isRead: false },
    order: [['createdAt', 'DESC']]
  });
};

module.exports = Alert;