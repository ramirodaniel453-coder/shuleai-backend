const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Admin = sequelize.define('Admin', {
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
  adminId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  position: {
    type: DataTypes.ENUM('headteacher', 'deputy', 'senior_teacher', 'admin_assistant', 'accounts', 'other'),
    defaultValue: 'admin_assistant'
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
    type: DataTypes.ENUM('permanent', 'contract'),
    defaultValue: 'permanent'
  },
  dateJoined: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  alternativePhone: {
    type: DataTypes.STRING(20)
  },
  address: {
    type: DataTypes.TEXT
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  responsibilities: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (admin) => {
      if (!admin.adminId) {
        const year = new Date().getFullYear();
        const count = await Admin.count();
        admin.adminId = `ADM-${year}-${(count + 1).toString().padStart(3, '0')}`;
      }
    }
  }
});

// Check if has specific permission
Admin.prototype.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Get full name from user (virtual)
Admin.prototype.fullName = function() {
  return this.user?.name;
};

module.exports = Admin;