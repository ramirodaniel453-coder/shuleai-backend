const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Parent = sequelize.define('Parent', {
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
  parentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  occupation: {
    type: DataTypes.STRING
  },
  idNumber: {
    type: DataTypes.STRING
  },
  relationship: {
    type: DataTypes.ENUM('father', 'mother', 'guardian', 'other'),
    defaultValue: 'guardian'
  },
  alternativePhone: {
    type: DataTypes.STRING(20)
  },
  workPhone: {
    type: DataTypes.STRING(20)
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
  authorizedPickup: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      notifications: {
        email: true,
        sms: true,
        push: true
      },
      guidanceTips: true,
      language: 'en'
    }
  },
  paymentMethods: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (parent) => {
      if (!parent.parentId) {
        const year = new Date().getFullYear();
        const count = await Parent.count();
        parent.parentId = `PAR-${year}-${(count + 1).toString().padStart(4, '0')}`;
      }
    }
  }
});

// Get all children names
Parent.prototype.getChildrenNames = async function() {
  const Student = require('./Student');
  const students = await Student.findAll({
    where: { id: this.children },
    include: ['user']
  });
  return students.map(s => s.user.name);
};

// Check if authorized to pickup
Parent.prototype.isAuthorizedPickup = function(personName, phone) {
  return this.authorizedPickup.some(p => 
    p.name.toLowerCase() === personName.toLowerCase() && p.phone === phone
  );
};

// Get default payment method
Parent.prototype.getDefaultPaymentMethod = function() {
  return this.paymentMethods.find(m => m.isDefault) || this.paymentMethods[0];
};

module.exports = Parent;