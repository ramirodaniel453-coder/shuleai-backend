const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AcademicRecord = sequelize.define('AcademicRecord', {
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
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  assessmentType: {
    type: DataTypes.ENUM('test', 'exam', 'assignment', 'project', 'quiz', 'cat'),
    allowNull: false
  },
  assessmentName: {
    type: DataTypes.STRING
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  grade: {
    type: DataTypes.STRING(2)
  },
  points: {
    type: DataTypes.INTEGER
  },
  remarks: {
    type: DataTypes.TEXT
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Teachers',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (record) => {
      calculateGrade(record);
    },
    beforeUpdate: (record) => {
      if (record.changed('score')) {
        calculateGrade(record);
      }
    }
  }
});

function calculateGrade(record) {
  const score = record.score;
  
  if (score >= 80) {
    record.grade = 'A';
    record.points = 12;
    record.remarks = 'Excellent';
  } else if (score >= 75) {
    record.grade = 'A-';
    record.points = 11;
    record.remarks = 'Very Good';
  } else if (score >= 70) {
    record.grade = 'B+';
    record.points = 10;
    record.remarks = 'Good';
  } else if (score >= 65) {
    record.grade = 'B';
    record.points = 9;
    record.remarks = 'Above Average';
  } else if (score >= 60) {
    record.grade = 'B-';
    record.points = 8;
    record.remarks = 'Average';
  } else if (score >= 55) {
    record.grade = 'C+';
    record.points = 7;
    record.remarks = 'Below Average';
  } else if (score >= 50) {
    record.grade = 'C';
    record.points = 6;
    record.remarks = 'Fair';
  } else if (score >= 45) {
    record.grade = 'C-';
    record.points = 5;
    record.remarks = 'Poor';
  } else if (score >= 40) {
    record.grade = 'D+';
    record.points = 4;
    record.remarks = 'Very Poor';
  } else {
    record.grade = 'E';
    record.points = 0;
    record.remarks = 'Fail';
  }
}

module.exports = AcademicRecord;