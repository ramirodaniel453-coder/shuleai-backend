const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'holiday', 'sick'),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  reportedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reportedByParent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  timeIn: {
    type: DataTypes.STRING(5)
  },
  timeOut: {
    type: DataTypes.STRING(5)
  },
  pickedUpBy: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'date']
    }
  ]
});

// Get attendance statistics
Attendance.getStats = async function(studentId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const records = await this.findAll({
    where: {
      studentId,
      date: { [Op.gte]: startDate }
    }
  });
  
  const total = records.length;
  if (total === 0) return { rate: 0, present: 0, absent: 0, late: 0 };
  
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  
  return {
    rate: ((present / total) * 100).toFixed(1),
    present,
    absent,
    late,
    total
  };
};

module.exports = Attendance;