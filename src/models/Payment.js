const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  parentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Parents',
      key: 'id'
    }
  },
  feeId: {
    type: DataTypes.UUID,
    references: {
      model: 'Fees',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('mpesa', 'bank', 'cash', 'card'),
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  receiptNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  plan: {
    type: DataTypes.ENUM('basic', 'premium', 'ultimate'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  transactionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  verifiedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  verifiedAt: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  },
  mpesaDetails: {
    type: DataTypes.JSONB
  },
  bankDetails: {
    type: DataTypes.JSONB
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (payment) => {
      if (!payment.receiptNumber && payment.status === 'completed') {
        const year = new Date().getFullYear();
        const count = await Payment.count({ where: { status: 'completed' } });
        payment.receiptNumber = `RCT/${year}/${(count + 1).toString().padStart(5, '0')}`;
      }
    },
    afterCreate: async (payment) => {
      if (payment.status === 'completed') {
        const Fee = require('./Fee');
        const Student = require('./Student');
        
        // Update fee
        if (payment.feeId) {
          const fee = await Fee.findByPk(payment.feeId);
          if (fee) {
            fee.paidAmount = parseFloat(fee.paidAmount) + parseFloat(payment.amount);
            fee.payments = [...(fee.payments || []), {
              amount: payment.amount,
              date: payment.transactionDate,
              method: payment.method,
              reference: payment.reference,
              status: 'completed'
            }];
            await fee.save();
          }
        }
        
        // Update student's paid amount
        const student = await Student.findByPk(payment.studentId);
        if (student) {
          student.paymentStatus.paid = parseFloat(student.paymentStatus.paid) + parseFloat(payment.amount);
          student.paymentStatus.lastPaymentDate = new Date();
          await student.save();
        }
      }
    }
  }
});

module.exports = Payment;