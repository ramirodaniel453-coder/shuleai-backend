module.exports = {
  SCHOOL_TYPES: {
    primary: 'Primary School',
    secondary: 'Secondary School'
  },
  
  PRIMARY_CLASSES: [
    'PP1', 'PP2', 
    'Grade 1', 'Grade 2', 'Grade 3', 
    'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'
  ],
  
  SECONDARY_CLASSES: [
    'Form 1', 'Form 2', 'Form 3', 'Form 4'
  ],
  
  CURRICULUM_SYSTEMS: {
    '844': '8-4-4 System',
    'cbc': 'Competency Based Curriculum',
    'british': 'British Curriculum',
    'american': 'American Curriculum'
  },
  
  TERMS: ['Term 1', 'Term 2', 'Term 3'],
  
  ASSESSMENT_TYPES: {
    primary: ['test', 'exam', 'assignment', 'project', 'observation'],
    secondary: ['cat', 'exam', 'assignment', 'project', 'quiz']
  },
  
  ATTENDANCE_STATUS: ['present', 'absent', 'late', 'holiday', 'sick'],
  
  ALERT_TYPES: ['academic', 'attendance', 'fee', 'system', 'improvement', 'duty', 'approval'],
  ALERT_SEVERITY: ['critical', 'warning', 'info', 'success'],
  
  PAYMENT_METHODS: ['mpesa', 'bank', 'cash', 'card'],
  
  PAYMENT_PLANS: {
    basic: { name: 'Basic Access', price: 5000 },
    premium: { name: 'Premium Access', price: 10000 },
    ultimate: { name: 'Ultimate Access', price: 15000 }
  },
  
  DUTY_TYPES: ['morning', 'lunch', 'afternoon', 'gate', 'dining', 'playground'],
  
  DUTY_AREAS: {
    morning: 'Morning Assembly',
    lunch: 'Lunch Break',
    gate: 'School Gate',
    dining: 'Dining Hall',
    playground: 'Playground',
    bus: 'School Bus'
  },
  
  DUTY_TIME_SLOTS: {
    morning: { start: '07:30', end: '08:30' },
    lunch: { start: '12:30', end: '14:00' },
    afternoon: { start: '15:30', end: '16:30' }
  },
  
  APPROVAL_STATUS: ['pending', 'approved', 'rejected', 'suspended'],
  UPLOAD_TYPES: ['students', 'marks', 'attendance'],
  
  SCHOOL_ID_FORMAT: 'SCH-YYYY-XXXXX',
  STUDENT_ID_PREFIX: 'STU',
  TEACHER_ID_PREFIX: 'TCH',
  PARENT_ID_PREFIX: 'PAR'
};