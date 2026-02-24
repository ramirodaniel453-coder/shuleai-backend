const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  senderRole: {
    type: DataTypes.ENUM('student', 'teacher', 'parent', 'admin', 'ai'),
    allowNull: false
  },
  senderName: {
    type: DataTypes.STRING
  },
  receiverId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  receiverRole: {
    type: DataTypes.STRING
  },
  chatType: {
    type: DataTypes.ENUM('private', 'group', 'ai', 'broadcast'),
    allowNull: false
  },
  groupId: {
    type: DataTypes.STRING
  },
  groupName: {
    type: DataTypes.STRING
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  readBy: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isRequest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  requestStatus: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    defaultValue: 'pending'
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  replyTo: {
    type: DataTypes.UUID,
    references: {
      model: 'Messages',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

// Mark message as read
Message.prototype.markAsRead = function(userId) {
  if (!this.readBy.some(r => r.userId === userId)) {
    this.readBy.push({ userId, readAt: new Date() });
  }
};

// Get unread count for user
Message.getUnreadCount = async function(userId) {
  return await this.count({
    where: {
      receiverId: userId,
      readBy: {
        [Op.not]: [{ userId }]
      }
    }
  });
};

module.exports = Message;