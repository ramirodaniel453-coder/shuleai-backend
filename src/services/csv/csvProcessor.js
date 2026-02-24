const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const moment = require('moment');
const { sequelize } = require('../../config/database');
const { User, Student, Teacher, Parent, AcademicRecord, Attendance } = require('../../models');

class CSVProcessor {
  constructor(schoolCode, userId) {
    this.schoolCode = schoolCode;
    this.userId = userId;
    this.stats = {
      processed: 0,
      skipped: 0,
      errors: 0,
      created: 0,
      updated: 0,
      elimuidsGenerated: 0
    };
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Process student upload CSV - Creates students with random ELIMUIDs
   */
  async processStudentUpload(filePath) {
    console.log('Processing student upload CSV...');
    const results = [];
    const students = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({
          mapHeaders: ({ header, index }) => this.normalizeHeader(header)
        }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            for (const row of results) {
              const student = await this.createStudentFromRow(row);
              if (student) {
                students.push(student);
              }
            }
            
            const summary = this.generateSummary(students);
            
            resolve({
              success: true,
              students,
              stats: this.stats,
              errors: this.errors,
              warnings: this.warnings,
              summary
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  /**
   * Process marks upload CSV - Handles historical dates, auto-grading
   */
  async processMarksUpload(filePath) {
    console.log('Processing marks upload CSV...');
    const results = [];
    const records = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({
          mapHeaders: ({ header, index }) => this.normalizeHeader(header)
        }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const byDate = this.groupByDate(results);
            const sortedDates = Object.keys(byDate).sort((a, b) => 
              moment(a).valueOf() - moment(b).valueOf()
            );

            for (const date of sortedDates) {
              const dayRecords = byDate[date];
              for (const row of dayRecords) {
                const record = await this.createAcademicRecord(row, date);
                if (record) {
                  records.push(record);
                }
              }
            }

            resolve({
              success: true,
              records,
              stats: this.stats,
              errors: this.errors,
              warnings: this.warnings,
              chronologicalOrder: sortedDates
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  /**
   * Process attendance upload CSV - Handles historical dates
   */
  async processAttendanceUpload(filePath) {
    console.log('Processing attendance upload CSV...');
    const results = [];
    const attendance = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({
          mapHeaders: ({ header, index }) => this.normalizeHeader(header)
        }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const byDate = this.groupByDate(results);
            
            for (const [date, dayRecords] of Object.entries(byDate)) {
              for (const row of dayRecords) {
                const record = await this.createAttendanceRecord(row, date);
                if (record) {
                  attendance.push(record);
                }
              }
            }

            resolve({
              success: true,
              attendance,
              stats: this.stats,
              errors: this.errors,
              warnings: this.warnings
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  /**
   * Generate random ELIMUID for student
   */
  generateELIMUID(existingIds = []) {
    const year = new Date().getFullYear();
    let elimuid;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      const random = Math.floor(1000 + Math.random() * 9000);
      elimuid = `STU-${year}-${random}`;
      attempts++;
    } while (existingIds.includes(elimuid) && attempts < maxAttempts);

    return elimuid;
  }

  /**
   * Create student from CSV row
   */
  async createStudentFromRow(row) {
    const transaction = await sequelize.transaction();
    
    try {
      if (!row.name) {
        this.errors.push(`Missing student name in row: ${JSON.stringify(row)}`);
        this.stats.errors++;
        await transaction.rollback();
        return null;
      }

      // Check if student already exists
      const existingUser = await User.findOne({ 
        where: { 
          name: row.name,
          schoolCode: this.schoolCode,
          role: 'student'
        }
      });

      if (existingUser) {
        this.stats.skipped++;
        this.warnings.push(`Student ${row.name} already exists, skipping`);
        await transaction.rollback();
        return null;
      }

      // Generate random ELIMUID
      const existingStudents = await Student.findAll({
        attributes: ['elimuid']
      });
      const existingIds = existingStudents.map(s => s.elimuid);
      const elimuid = this.generateELIMUID(existingIds);
      this.stats.elimuidsGenerated++;

      // Create user account
      const user = await User.create({
        name: row.name,
        email: row.email || `${row.name.replace(/\s+/g, '.').toLowerCase()}@student.school.edu`,
        password: 'Student123!',
        role: 'student',
        schoolCode: this.schoolCode,
        phone: row.phone || ''
      }, { transaction });

      // Parse grade with fallback
      const className = this.parseGrade(row.grade || row.class || 'Not Assigned');

      // Create student profile
      const student = await Student.create({
        userId: user.id,
        admissionNumber: row.admissionNumber || null,
        elimuid,
        className,
        stream: row.stream || null,
        dateOfBirth: this.parseDate(row.dob || row.birthdate || row.dateOfBirth) || new Date(2000, 0, 1),
        gender: this.normalizeGender(row.gender),
        enrollmentDate: this.parseDate(row.enrollmentDate) || new Date(),
        address: row.address || '',
        city: row.city || '',
        phone: row.studentPhone || '',
        status: 'active'
      }, { transaction });

      // Handle parent assignment if email provided
      if (row.parentEmail) {
        await this.assignParent(student, row, transaction);
      }

      await transaction.commit();

      this.stats.created++;
      this.stats.processed++;

      return student;
    } catch (error) {
      await transaction.rollback();
      this.errors.push(`Error creating student ${row.name}: ${error.message}`);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Create academic record from CSV row
   */
  async createAcademicRecord(row, defaultDate = null) {
    const transaction = await sequelize.transaction();
    
    try {
      // Find student by name or ELIMUID
      let student = null;
      
      if (row.elimuid) {
        student = await Student.findOne({ 
          where: { elimuid: row.elimuid },
          include: [{ model: User, as: 'user' }]
        });
      } else if (row.name) {
        const user = await User.findOne({ 
          where: { 
            name: row.name,
            schoolCode: this.schoolCode,
            role: 'student'
          }
        });
        if (user) {
          student = await Student.findOne({ where: { userId: user.id } });
        }
      }

      if (!student) {
        this.errors.push(`Student not found: ${row.name || row.elimuid}`);
        this.stats.errors++;
        await transaction.rollback();
        return null;
      }

      // Parse date
      const date = this.parseDate(row.date || row.assessmentDate || defaultDate);
      if (!date) {
        this.warnings.push(`No valid date for student, using current date`);
      }

      // Parse term from date or row
      const term = this.determineTerm(date, row.term);

      // Parse score
      const score = this.parseScore(row.score || row.marks || row.grade);

      // Get teacher
      const teacher = await Teacher.findOne({ 
        where: { userId: this.userId }
      });

      if (!teacher) {
        this.errors.push(`Teacher not found for ID: ${this.userId}`);
        this.stats.errors++;
        await transaction.rollback();
        return null;
      }

      // Create academic record
      const record = await AcademicRecord.create({
        studentId: student.id,
        schoolCode: this.schoolCode,
        term,
        year: date ? date.getFullYear() : new Date().getFullYear(),
        subject: this.normalizeSubject(row.subject),
        assessmentType: this.normalizeAssessmentType(row.type || row.assessmentType),
        assessmentName: row.assessmentName || `${row.subject} Assessment`,
        score,
        teacherId: teacher.id,
        date: date || new Date(),
        isPublished: true
      }, { transaction });

      await transaction.commit();

      this.stats.created++;
      this.stats.processed++;

      return record;
    } catch (error) {
      await transaction.rollback();
      this.errors.push(`Error creating record: ${error.message}`);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Create attendance record from CSV row
   */
  async createAttendanceRecord(row, defaultDate = null) {
    const transaction = await sequelize.transaction();
    
    try {
      // Find student
      let student = null;
      
      if (row.elimuid) {
        student = await Student.findOne({ 
          where: { elimuid: row.elimuid },
          include: [{ model: User, as: 'user' }]
        });
      } else if (row.name) {
        const user = await User.findOne({ 
          where: { 
            name: row.name,
            schoolCode: this.schoolCode,
            role: 'student'
          }
        });
        if (user) {
          student = await Student.findOne({ where: { userId: user.id } });
        }
      }

      if (!student) {
        this.errors.push(`Student not found: ${row.name || row.elimuid}`);
        this.stats.errors++;
        await transaction.rollback();
        return null;
      }

      // Parse date
      const date = this.parseDate(row.date || defaultDate);
      if (!date) {
        this.errors.push(`Invalid date for student`);
        this.stats.errors++;
        await transaction.rollback();
        return null;
      }

      // Normalize status
      const status = this.normalizeAttendanceStatus(row.status || row.attendance);

      // Check for existing record
      const existing = await Attendance.findOne({
        where: {
          studentId: student.id,
          date: {
            [Op.eq]: date
          }
        }
      });

      if (existing) {
        this.stats.skipped++;
        this.warnings.push(`Attendance already exists for student on ${date.toLocaleDateString()}`);
        await transaction.rollback();
        return existing;
      }

      // Create attendance record
      const attendance = await Attendance.create({
        studentId: student.id,
        schoolCode: this.schoolCode,
        date,
        status,
        reason: row.reason || '',
        reportedBy: this.userId,
        reportedByParent: false,
        timeIn: row.timeIn || this.getDefaultTimeIn(status),
        timeOut: row.timeOut || this.getDefaultTimeOut(status)
      }, { transaction });

      await transaction.commit();

      this.stats.created++;
      this.stats.processed++;

      return attendance;
    } catch (error) {
      await transaction.rollback();
      this.errors.push(`Error creating attendance: ${error.message}`);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Assign parent to student
   */
  async assignParent(student, row, transaction) {
    try {
      let parent = await Parent.findOne({ 
        include: [{
          model: User,
          where: { email: row.parentEmail }
        }]
      });

      if (!parent) {
        // Create new parent user
        const parentUser = await User.create({
          name: row.parentName || `Parent of ${student.user.name}`,
          email: row.parentEmail,
          password: 'Parent123!',
          role: 'parent',
          schoolCode: this.schoolCode,
          phone: row.parentPhone || ''
        }, { transaction });

        parent = await Parent.create({
          userId: parentUser.id,
          parentId: `PAR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          relationship: row.relationship || 'guardian',
          emergencyContact: {
            name: parentUser.name,
            phone: row.parentPhone || ''
          }
        }, { transaction });
      }

      // Add student to parent's children (through junction table)
      await parent.addStudent(student.id, { transaction });

    } catch (error) {
      this.warnings.push(`Failed to assign parent: ${error.message}`);
    }
  }

  /**
   * Group records by date
   */
  groupByDate(records) {
    const byDate = {};

    records.forEach(record => {
      const dateStr = this.extractDateFromRow(record);
      if (!byDate[dateStr]) {
        byDate[dateStr] = [];
      }
      byDate[dateStr].push(record);
    });

    return byDate;
  }

  /**
   * Extract date from row
   */
  extractDateFromRow(row) {
    const possibleDateFields = ['date', 'assessmentDate', 'examDate', 'testDate', 'attendanceDate'];
    
    for (const field of possibleDateFields) {
      if (row[field]) {
        const parsed = this.parseDate(row[field]);
        if (parsed) {
          return parsed.toISOString().split('T')[0];
        }
      }
    }
    
    return moment().format('YYYY-MM-DD');
  }

  /**
   * Parse date from various formats
   */
  parseDate(dateStr) {
    if (!dateStr) return null;

    const formats = [
      'YYYY-MM-DD',
      'DD/MM/YYYY',
      'MM/DD/YYYY',
      'DD-MM-YYYY',
      'MM-DD-YYYY',
      'YYYY/MM/DD',
      'DD.MM.YYYY',
      'MMMM DD, YYYY',
      'DD MMM YYYY',
      'MMM DD, YYYY'
    ];

    for (const format of formats) {
      const parsed = moment(dateStr, format, true);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }

    const excelSerial = parseInt(dateStr);
    if (!isNaN(excelSerial) && excelSerial > 40000) {
      const excelEpoch = moment('1900-01-01');
      return excelEpoch.add(excelSerial - 2, 'days').toDate();
    }

    return null;
  }

  /**
   * Parse score from various formats
   */
  parseScore(scoreStr) {
    if (!scoreStr) return 0;

    if (typeof scoreStr === 'string' && scoreStr.includes('/')) {
      const [numerator, denominator] = scoreStr.split('/').map(Number);
      return Math.round((numerator / denominator) * 100);
    }

    if (typeof scoreStr === 'string' && scoreStr.includes('%')) {
      return parseFloat(scoreStr.replace('%', ''));
    }

    if (typeof scoreStr === 'string' && isNaN(parseFloat(scoreStr))) {
      return this.convertLetterGradeToScore(scoreStr);
    }

    const score = parseFloat(scoreStr);
    return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
  }

  /**
   * Convert letter grade to approximate score
   */
  convertLetterGradeToScore(grade) {
    const gradeMap = {
      'A': 90, 'A-': 87, 'A+': 95,
      'B': 80, 'B-': 77, 'B+': 85,
      'C': 70, 'C-': 67, 'C+': 75,
      'D': 60, 'D-': 57, 'D+': 65,
      'E': 50, 'F': 40
    };
    return gradeMap[grade.toUpperCase()] || 50;
  }

  /**
   * Determine term from date
   */
  determineTerm(date, providedTerm = null) {
    if (providedTerm) return providedTerm;

    if (!date) return 'Term 1';

    const month = date.getMonth() + 1;
    
    if (month >= 1 && month <= 4) return 'Term 1';
    if (month >= 5 && month <= 8) return 'Term 2';
    return 'Term 3';
  }

  /**
   * Parse grade from various formats
   */
  parseGrade(gradeStr) {
    if (!gradeStr) return 'Not Assigned';
    
    const match = gradeStr.match(/\d+/);
    if (match) {
      const num = parseInt(match[0]);
      if (gradeStr.toLowerCase().includes('form')) {
        return `Form ${num}`;
      }
      return `Grade ${num}`;
    }
    
    return gradeStr;
  }

  /**
   * Normalize gender
   */
  normalizeGender(gender) {
    if (!gender) return 'other';
    
    const g = gender.toLowerCase().trim();
    if (g === 'm' || g === 'male') return 'male';
    if (g === 'f' || g === 'female') return 'female';
    return 'other';
  }

  /**
   * Normalize subject name
   */
  normalizeSubject(subject) {
    if (!subject) return 'General';
    
    const subjectMap = {
      'math': 'Mathematics',
      'maths': 'Mathematics',
      'eng': 'English',
      'sci': 'Science',
      'bio': 'Biology',
      'chem': 'Chemistry',
      'phy': 'Physics',
      'hist': 'History',
      'geo': 'Geography',
      'kisw': 'Kiswahili',
      'cre': 'CRE',
      'ire': 'IRE'
    };

    const lower = subject.toLowerCase().trim();
    return subjectMap[lower] || subject;
  }

  /**
   * Normalize assessment type
   */
  normalizeAssessmentType(type) {
    if (!type) return 'test';
    
    const lower = type.toLowerCase().trim();
    
    if (lower.includes('exam')) return 'exam';
    if (lower.includes('test')) return 'test';
    if (lower.includes('assignment') || lower.includes('homework')) return 'assignment';
    if (lower.includes('project')) return 'project';
    if (lower.includes('quiz')) return 'quiz';
    if (lower.includes('cat')) return 'cat';
    
    return 'test';
  }

  /**
   * Normalize attendance status
   */
  normalizeAttendanceStatus(status) {
    if (!status) return 'present';
    
    const lower = status.toLowerCase().trim();
    
    if (lower === 'p' || lower === 'present' || lower === '✅') return 'present';
    if (lower === 'a' || lower === 'absent' || lower === '❌') return 'absent';
    if (lower === 'l' || lower === 'late' || lower === '⏰') return 'late';
    if (lower === 's' || lower === 'sick' || lower === '🤒') return 'sick';
    if (lower === 'h' || lower === 'holiday' || lower === '🏖️') return 'holiday';
    
    return 'present';
  }

  /**
   * Get default time in based on status
   */
  getDefaultTimeIn(status) {
    if (status === 'late') return '08:30';
    if (status === 'present') return '08:00';
    return '-';
  }

  /**
   * Get default time out
   */
  getDefaultTimeOut(status) {
    if (status === 'present' || status === 'late') return '15:30';
    return '-';
  }

  /**
   * Normalize CSV header names
   */
  normalizeHeader(header) {
    if (!header) return '';
    
    let normalized = header.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
    
    const headerMap = {
      'fullname': 'name',
      'studentname': 'name',
      'student': 'name',
      'pupil': 'name',
      'child': 'name',
      'firstname': 'firstName',
      'lastname': 'lastName',
      'surname': 'lastName',
      'givenname': 'firstName',
      'id': 'elimuid',
      'studentid': 'elimuid',
      'admission': 'elimuid',
      'regno': 'elimuid',
      'registration': 'elimuid',
      'class': 'grade',
      'form': 'grade',
      'year': 'grade',
      'level': 'grade',
      'mark': 'score',
      'marks': 'score',
      'grade': 'score',
      'result': 'score',
      'points': 'score',
      'attend': 'status',
      'attendance': 'status',
      'present': 'status',
      'subjectname': 'subject',
      'course': 'subject'
    };

    return headerMap[normalized] || normalized;
  }

  /**
   * Generate summary of processing
   */
  generateSummary(students) {
    const byGrade = {};
    
    students.forEach(student => {
      const grade = student.className || 'Unassigned';
      if (!byGrade[grade]) {
        byGrade[grade] = 0;
      }
      byGrade[grade]++;
    });
    
    return {
      totalStudents: students.length,
      byGrade,
      elimuidsGenerated: this.stats.elimuidsGenerated,
      sampleElimuids: students.slice(0, 5).map(s => ({
        name: s.user?.name,
        elimuid: s.elimuid
      }))
    };
  }

  /**
   * Validate CSV structure
   */
  validateCSV(headers, type) {
    const requiredFields = {
      student: ['name'],
      marks: ['name', 'subject', 'score'],
      attendance: ['name', 'date', 'status']
    };

    const required = requiredFields[type] || [];
    const missing = required.filter(field => !headers.includes(field));

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return true;
  }

  /**
   * Generate error report CSV
   */
  generateErrorReport() {
    const report = this.errors.map(error => ({
      error,
      timestamp: new Date().toISOString(),
      type: 'error'
    }));

    return stringify(report, { header: true });
  }

  /**
   * Generate success report CSV with ELIMUIDs
   */
  generateSuccessReport(students) {
    const report = students.map(student => ({
      name: student.user?.name,
      elimuid: student.elimuid,
      class: student.className,
      stream: student.stream,
      status: 'Created',
      date: new Date().toLocaleDateString()
    }));

    return stringify(report, { header: true });
  }
}

module.exports = CSVProcessor;