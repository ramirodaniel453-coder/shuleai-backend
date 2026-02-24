const { sequelize } = require('../config/database');
const {
  User,
  School,
  Student,
  Teacher,
  Parent,
  Admin,
  AcademicRecord,
  Attendance,
  Fee,
  Payment
} = require('../models');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Sync database
    await sequelize.sync({ force: true });

    // Create a school
    const school = await School.create({
      name: 'Demo School',
      schoolType: 'secondary',
      curriculum: '844',
      classes: ['Form 1', 'Form 2', 'Form 3', 'Form 4'],
      streams: [
        { name: 'East', class: 'Form 1', capacity: 40 },
        { name: 'West', class: 'Form 1', capacity: 40 }
      ],
      contact: {
        phone: '+254712345678',
        email: 'info@demoschool.ac.ke',
        website: 'www.demoschool.ac.ke'
      },
      address: {
        street: '123 Education Lane',
        city: 'Nairobi',
        county: 'Nairobi',
        country: 'Kenya'
      },
      motto: 'Excellence in Education',
      established: 1990
    });

    console.log(`✅ School created: ${school.name} (${school.schoolId})`);

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@demoschool.ac.ke',
      password: 'Admin123!',
      role: 'admin',
      phone: '+254712345678',
      schoolCode: school.code
    });

    await Admin.create({
      userId: adminUser.id,
      position: 'headteacher',
      permissions: ['*']
    });

    console.log('✅ Admin created');

    // Create teachers
    const teachers = [];
    const teacherNames = [
      'John Doe', 'Jane Smith', 'Peter Kimani', 'Mary Wanjiku',
      'David Omondi', 'Sarah Mutua', 'James Kariuki', 'Lucy Achieng'
    ];

    for (const name of teacherNames) {
      const user = await User.create({
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@demoschool.ac.ke`,
        password: 'Teacher123!',
        role: 'teacher',
        phone: '+2547' + Math.floor(10000000 + Math.random() * 90000000),
        schoolCode: school.code
      });

      const teacher = await Teacher.create({
        userId: user.id,
        subjects: [
          { name: 'Mathematics', class: ['Form 1', 'Form 2'], isMain: true },
          { name: 'Physics', class: ['Form 3', 'Form 4'] }
        ],
        qualification: 'B.Ed Mathematics',
        specialization: 'Pure Mathematics',
        employmentType: 'permanent',
        dateJoined: new Date(2020, 0, 15),
        approvalStatus: 'approved',
        approvedAt: new Date()
      });

      teachers.push(teacher);
      console.log(`✅ Teacher created: ${name}`);
    }

    // Create parents and students
    const parents = [];
    const parentNames = [
      'Robert Johnson', 'Elizabeth Kamau', 'Michael Otieno', 'Grace Nduta',
      'William Kipchoge', 'Catherine Muthoni', 'Joseph Njoroge', 'Rose Akinyi'
    ];

    const studentNames = [
      'Alice Johnson', 'Brian Kamau', 'Charles Otieno', 'Diana Nduta',
      'Eric Kipchoge', 'Fiona Muthoni', 'George Njoroge', 'Hellen Akinyi',
      'Ian Omondi', 'Janet Wambui', 'Kevin Odhiambo', 'Linda Achieng',
      'Mark Mwangi', 'Nancy Njeri', 'Oscar Kiprono', 'Patricia Adhiambo'
    ];

    for (let i = 0; i < parentNames.length; i++) {
      // Create parent user
      const parentUser = await User.create({
        name: parentNames[i],
        email: `${parentNames[i].toLowerCase().replace(' ', '.')}@gmail.com`,
        password: 'Parent123!',
        role: 'parent',
        phone: '+2547' + Math.floor(10000000 + Math.random() * 90000000),
        schoolCode: school.code
      });

      const parent = await Parent.create({
        userId: parentUser.id,
        occupation: ['Teacher', 'Engineer', 'Doctor', 'Business'][Math.floor(Math.random() * 4)],
        relationship: ['father', 'mother'][Math.floor(Math.random() * 2)],
        preferences: {
          notifications: {
            email: true,
            sms: true,
            push: true
          },
          guidanceTips: true,
          language: 'en'
        }
      });

      parents.push(parent);

      // Create 2 students per parent
      for (let j = 0; j < 2; j++) {
        const studentIndex = i * 2 + j;
        if (studentIndex < studentNames.length) {
          const studentUser = await User.create({
            name: studentNames[studentIndex],
            email: `${studentNames[studentIndex].toLowerCase().replace(' ', '.')}@student.demoschool.ac.ke`,
            password: 'Student123!',
            role: 'student',
            schoolCode: school.code
          });

          const birthYear = 2006 + Math.floor(Math.random() * 4);
          const birthMonth = 1 + Math.floor(Math.random() * 12);
          const birthDay = 1 + Math.floor(Math.random() * 28);

          const form = ['Form 1', 'Form 2', 'Form 3', 'Form 4'][Math.floor(Math.random() * 4)];
          const stream = school.streams.filter(s => s.class === form)[0]?.name || 'East';

          const student = await Student.create({
            userId: studentUser.id,
            className: form,
            stream,
            dateOfBirth: new Date(birthYear, birthMonth, birthDay),
            gender: j % 2 === 0 ? 'male' : 'female',
            enrollmentDate: new Date(2023, 0, 15),
            address: '123 Student Lane',
            city: 'Nairobi',
            emergencyContact: {
              name: parentNames[i],
              relationship: 'Parent',
              phone: parentUser.phone
            }
          });

          // Add parent-student relationship
          await student.addParent(parent.id);

          console.log(`✅ Student created: ${studentNames[studentIndex]} (${form} ${stream})`);

          // Create academic records for student
          const subjects = ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography'];
          const terms = ['Term 1', 'Term 2', 'Term 3'];
          
          for (const term of terms) {
            for (const subject of subjects.slice(0, 6)) { // 6 subjects per term
              const score = 40 + Math.floor(Math.random() * 50); // Random score between 40-90
              
              await AcademicRecord.create({
                studentId: student.id,
                schoolCode: school.code,
                term,
                year: 2024,
                subject,
                assessmentType: 'exam',
                assessmentName: `${term} Examination`,
                score,
                teacherId: teachers[Math.floor(Math.random() * teachers.length)].id,
                date: new Date(2024, terms.indexOf(term) * 4 + 2, 15),
                isPublished: true
              });
            }
          }

          // Create attendance records
          const daysInTerm = 60;
          for (let day = 0; day < daysInTerm; day++) {
            const date = new Date(2024, 0, 15 + day);
            if (date.getDay() !== 0) { // Skip Sundays
              const status = Math.random() > 0.9 ? 'absent' : Math.random() > 0.8 ? 'late' : 'present';
              
              await Attendance.create({
                studentId: student.id,
                schoolCode: school.code,
                date,
                status,
                timeIn: status === 'late' ? '08:30' : '08:00',
                timeOut: '15:30'
              });
            }
          }

          // Create fee records
          const feeAmounts = {
            'Form 1': 50000,
            'Form 2': 45000,
            'Form 3': 55000,
            'Form 4': 60000
          };

          await Fee.create({
            studentId: student.id,
            schoolCode: school.code,
            term: 'Term 1',
            year: 2024,
            feeItems: [
              { name: 'Tuition', amount: 30000 },
              { name: 'Boarding', amount: 15000 },
              { name: 'Activities', amount: 5000 }
            ],
            totalAmount: feeAmounts[form] || 50000,
            paidAmount: Math.random() > 0.3 ? feeAmounts[form] : feeAmounts[form] * 0.5,
            dueDate: new Date(2024, 3, 15)
          });
        }
      }
    }

    // Create duty rosters
    const dutyRoster = await DutyRoster.create({
      schoolCode: school.code,
      date: new Date(),
      duties: teachers.slice(0, 3).map((teacher, index) => ({
        teacherId: teacher.id,
        teacherName: teacher.user.name,
        type: ['morning', 'lunch', 'afternoon'][index],
        area: ['School Gate', 'Dining Hall', 'Playground'][index],
        timeSlot: index === 0 ? { start: '07:30', end: '08:30' } :
                 index === 1 ? { start: '12:30', end: '14:00' } :
                 { start: '15:30', end: '16:30' },
        status: 'scheduled'
      })),
      createdBy: adminUser.id,
      publishedAt: new Date()
    });

    console.log('✅ Duty roster created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@demoschool.ac.ke / Admin123!');
    console.log('Teacher: john.doe@demoschool.ac.ke / Teacher123!');
    console.log('Parent: robert.johnson@gmail.com / Parent123!');
    console.log('Student: alice.johnson@student.demoschool.ac.ke / Student123!');
    console.log(`\n🏫 School ID: ${school.schoolId}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;