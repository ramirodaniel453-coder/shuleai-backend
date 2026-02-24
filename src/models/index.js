const { sequelize } = require('../config/database');
const User = require('./User');
const School = require('./School');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Parent = require('./Parent');
const Admin = require('./Admin');
const AcademicRecord = require('./AcademicRecord');
const Attendance = require('./Attendance');
const Fee = require('./Fee');
const Payment = require('./Payment');
const Message = require('./Message');
const Alert = require('./Alert');
const ApprovalRequest = require('./ApprovalRequest');
const DutyRoster = require('./DutyRoster');
const UploadLog = require('./UploadLog');
const SchoolNameRequest = require('./SchoolNameRequest');

// Define associations

// User associations
User.hasOne(Student, { foreignKey: 'userId' });
User.hasOne(Teacher, { foreignKey: 'userId' });
User.hasOne(Parent, { foreignKey: 'userId' });
User.hasOne(Admin, { foreignKey: 'userId' });

Student.belongsTo(User, { foreignKey: 'userId' });
Teacher.belongsTo(User, { foreignKey: 'userId' });
Parent.belongsTo(User, { foreignKey: 'userId' });
Admin.belongsTo(User, { foreignKey: 'userId' });

// School associations
School.hasMany(User, { foreignKey: 'schoolCode', sourceKey: 'code' });
School.hasMany(Student, { foreignKey: 'schoolCode', sourceKey: 'code' });
School.hasMany(Teacher, { foreignKey: 'schoolCode', sourceKey: 'code' });
School.hasMany(Parent, { foreignKey: 'schoolCode', sourceKey: 'code' });
School.hasMany(AcademicRecord, { foreignKey: 'schoolCode', sourceKey: 'code' });
School.hasMany(Attendance, { foreignKey: 'schoolCode', sourceKey: 'code' });
School.hasMany(Fee, { foreignKey: 'schoolCode', sourceKey: 'code' });
School.hasMany(DutyRoster, { foreignKey: 'schoolCode', sourceKey: 'code' });
School.hasMany(ApprovalRequest, { foreignKey: 'schoolCode', sourceKey: 'code' });

User.belongsTo(School, { foreignKey: 'schoolCode', targetKey: 'code' });
Student.belongsTo(School, { foreignKey: 'schoolCode', targetKey: 'code' });
Teacher.belongsTo(School, { foreignKey: 'schoolCode', targetKey: 'code' });
Parent.belongsTo(School, { foreignKey: 'schoolCode', targetKey: 'code' });

// Parent-Student associations (many-to-many)
Parent.belongsToMany(Student, { through: 'ParentStudents', foreignKey: 'parentId' });
Student.belongsToMany(Parent, { through: 'ParentStudents', foreignKey: 'studentId' });

// Teacher-Student associations
Teacher.hasMany(AcademicRecord, { foreignKey: 'teacherId' });
AcademicRecord.belongsTo(Teacher, { foreignKey: 'teacherId' });

Teacher.hasMany(Attendance, { foreignKey: 'teacherId' });
Attendance.belongsTo(Teacher, { foreignKey: 'teacherId' });

// Student associations
Student.hasMany(AcademicRecord, { foreignKey: 'studentId' });
AcademicRecord.belongsTo(Student, { foreignKey: 'studentId' });

Student.hasMany(Attendance, { foreignKey: 'studentId' });
Attendance.belongsTo(Student, { foreignKey: 'studentId' });

Student.hasMany(Fee, { foreignKey: 'studentId' });
Fee.belongsTo(Student, { foreignKey: 'studentId' });

Student.hasMany(Payment, { foreignKey: 'studentId' });
Payment.belongsTo(Student, { foreignKey: 'studentId' });

// Parent associations
Parent.hasMany(Payment, { foreignKey: 'parentId' });
Payment.belongsTo(Parent, { foreignKey: 'parentId' });

// DutyRoster associations
DutyRoster.belongsTo(School, { foreignKey: 'schoolCode', targetKey: 'code' });
DutyRoster.belongsTo(User, { foreignKey: 'createdBy' });

// Message associations
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

// Alert associations
Alert.belongsTo(User, { foreignKey: 'userId' });

// ApprovalRequest associations
ApprovalRequest.belongsTo(School, { foreignKey: 'schoolCode', targetKey: 'code' });
ApprovalRequest.belongsTo(User, { foreignKey: 'userId' });
ApprovalRequest.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewedBy' });

// Export all models
module.exports = {
  sequelize,
  User,
  School,
  Student,
  Teacher,
  Parent,
  Admin,
  AcademicRecord,
  Attendance,
  Fee,
  Payment,
  Message,
  Alert,
  ApprovalRequest,
  DutyRoster,
  UploadLog,
  SchoolNameRequest
};