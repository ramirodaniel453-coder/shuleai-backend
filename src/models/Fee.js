const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Students',
      key: 'id'
    }
  },
  schoolCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: 'Schools',
      key: 'code'
    }
  },
  term: {
    type: DataTypes.ENUM('Term 1', 'Term 2', 'Term 3'),
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  feeItems: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  dueDate: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('paid', 'partial', 'unpaid', 'overdue'),
    defaultValue: 'unpaid'
  },
  paymentPlan: {
    type: DataTypes.JSONB,
    defaultValue: {
      type: 'basic',
      installments: null,
      installmentAmount: null
    }
  },
  payments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  reminders: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (fee) => {
      calculateBalance(fee);
    },
    beforeUpdate: (fee) => {
      if (fee.changed('paidAmount') || fee.changed('totalAmount')) {
        calculateBalance(fee);
      }
    }
  }
});

function calculateBalance(fee) {
  fee.balance = parseFloat(fee.totalAmount) - parseFloat(fee.paidAmount);
  
  if (fee.balance <= 0) {
    fee.status = 'paid';
  } else if (fee.paidAmount > 0) {
    fee.status = 'partial';
  } else {
    fee.status = 'unpaid';
  }
  
  if (fee.dueDate && new Date() > new Date(fee.dueDate) && fee.balance > 0) {
    fee.status = 'overdue';
  }
}

// Get outstanding fees for student
Fee.getOutstandingFees = async function(studentId) {
  const fees = await this.findAll({
    where: {
      studentId,
      status: ['unpaid', 'partial', 'overdue']
    }
  });
  
  return {
    total: fees.reduce((sum, f) => sum + parseFloat(f.balance), 0),
    count: fees.length,
    fees
  };
};

module.exports = Fee;