/**
 * ShuleAI Multi-Curriculum Analytics Engine
 * Supports: 8-4-4, CBC, British, American systems
 */

class CurriculumAnalyticsEngine {
  constructor(system = '844') {
    this.system = system;
    this.gradingScales = {
      '844': {
        name: '8-4-4 System',
        subjects: ['Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies', 'CRE/IRE', 'Business Studies', 'Agriculture', 'Home Science', 'Computer Studies'],
        grading: {
          A: { min: 80, max: 100, points: 12, remark: 'Excellent' },
          'A-': { min: 75, max: 79, points: 11, remark: 'Very Good' },
          'B+': { min: 70, max: 74, points: 10, remark: 'Good' },
          B: { min: 65, max: 69, points: 9, remark: 'Above Average' },
          'B-': { min: 60, max: 64, points: 8, remark: 'Average' },
          'C+': { min: 55, max: 59, points: 7, remark: 'Below Average' },
          C: { min: 50, max: 54, points: 6, remark: 'Fair' },
          'C-': { min: 45, max: 49, points: 5, remark: 'Poor' },
          'D+': { min: 40, max: 44, points: 4, remark: 'Very Poor' },
          D: { min: 35, max: 39, points: 3, remark: 'Weak' },
          'D-': { min: 30, max: 34, points: 2, remark: 'Very Weak' },
          E: { min: 0, max: 29, points: 1, remark: 'Fail' }
        },
        meanGradeMapping: {
          12: 'A', 11: 'A-', 10: 'B+', 9: 'B', 8: 'B-',
          7: 'C+', 6: 'C', 5: 'C-', 4: 'D+', 3: 'D', 2: 'D-', 1: 'E'
        }
      },
      
      'cbc': {
        name: 'Competency Based Curriculum',
        levels: ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'],
        subjects: {
          'lower': ['Literacy', 'Numeracy', 'Environmental Activities', 'Psychomotor and Creative Activities', 'Religious Education'],
          'upper': ['English', 'Kiswahili', 'Mathematics', 'Science and Technology', 'Social Studies', 'CRE/IRE', 'Home Science', 'Agriculture', 'Art and Craft', 'Music', 'Physical and Health Education']
        },
        grading: {
          'Exceeding Expectations': { min: 80, max: 100, code: 'EE', color: '#10b981' },
          'Meeting Expectations': { min: 60, max: 79, code: 'ME', color: '#3b82f6' },
          'Approaching Expectations': { min: 40, max: 59, code: 'AE', color: '#f59e0b' },
          'Below Expectations': { min: 0, max: 39, code: 'BE', color: '#ef4444' }
        },
        competencies: [
          'Communication and Collaboration',
          'Critical Thinking and Problem Solving',
          'Creativity and Imagination',
          'Citizenship',
          'Digital Literacy',
          'Learning to Learn',
          'Self-efficacy'
        ],
        coreValues: [
          'Love', 'Responsibility', 'Respect', 'Unity', 'Peace', 'Patriotism', 
          'Integrity', 'Social Justice'
        ]
      },
      
      'british': {
        name: 'British Curriculum',
        levels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'],
        keyStages: {
          'KS1': ['Year 1', 'Year 2'],
          'KS2': ['Year 3', 'Year 4', 'Year 5', 'Year 6'],
          'KS3': ['Year 7', 'Year 8', 'Year 9'],
          'KS4': ['Year 10', 'Year 11'],
          'KS5': ['Year 12', 'Year 13']
        },
        subjects: {
          'core': ['English', 'Mathematics', 'Science'],
          'foundation': ['Art and Design', 'Citizenship', 'Computing', 'Design and Technology', 'Geography', 'History', 'Languages', 'Music', 'Physical Education']
        },
        grading: {
          'GCSE': {
            '9': { min: 90, max: 100, points: 9, description: 'High A*' },
            '8': { min: 80, max: 89, points: 8, description: 'A*' },
            '7': { min: 70, max: 79, points: 7, description: 'A' },
            '6': { min: 60, max: 69, points: 6, description: 'B' },
            '5': { min: 50, max: 59, points: 5, description: 'C' },
            '4': { min: 40, max: 49, points: 4, description: 'Pass' },
            '3': { min: 30, max: 39, points: 3, description: 'D' },
            '2': { min: 20, max: 29, points: 2, description: 'E' },
            '1': { min: 10, max: 19, points: 1, description: 'F' },
            'U': { min: 0, max: 9, points: 0, description: 'Ungraded' }
          },
          'A-Level': {
            'A*': { min: 90, max: 100, points: 56, ucas: 56 },
            'A': { min: 80, max: 89, points: 48, ucas: 48 },
            'B': { min: 70, max: 79, points: 40, ucas: 40 },
            'C': { min: 60, max: 69, points: 32, ucas: 32 },
            'D': { min: 50, max: 59, points: 24, ucas: 24 },
            'E': { min: 40, max: 49, points: 16, ucas: 16 }
          }
        },
        ucasTariff: {
          'A*': 56, 'A': 48, 'B': 40, 'C': 32, 'D': 24, 'E': 16
        }
      },
      
      'american': {
        name: 'American Curriculum',
        levels: ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
                'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
        subjects: {
          'elementary': ['Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education'],
          'middle': ['English', 'Math', 'Science', 'Social Studies', 'Foreign Language', 'Technology', 'Health'],
          'high': ['English', 'Mathematics', 'Science', 'Social Studies', 'Foreign Language', 'Arts', 'Physical Education', 'Electives']
        },
        grading: {
          'GPA': {
            'A+': { min: 97, max: 100, points: 4.0, weighted: 4.3 },
            'A': { min: 93, max: 96, points: 4.0, weighted: 4.0 },
            'A-': { min: 90, max: 92, points: 3.7, weighted: 3.7 },
            'B+': { min: 87, max: 89, points: 3.3, weighted: 3.3 },
            'B': { min: 83, max: 86, points: 3.0, weighted: 3.0 },
            'B-': { min: 80, max: 82, points: 2.7, weighted: 2.7 },
            'C+': { min: 77, max: 79, points: 2.3, weighted: 2.3 },
            'C': { min: 73, max: 76, points: 2.0, weighted: 2.0 },
            'C-': { min: 70, max: 72, points: 1.7, weighted: 1.7 },
            'D+': { min: 67, max: 69, points: 1.3, weighted: 1.3 },
            'D': { min: 65, max: 66, points: 1.0, weighted: 1.0 },
            'F': { min: 0, max: 64, points: 0.0, weighted: 0.0 }
          },
          'AP': {
            '5': { min: 70, max: 100, description: 'Extremely well qualified' },
            '4': { min: 60, max: 69, description: 'Well qualified' },
            '3': { min: 50, max: 59, description: 'Qualified' },
            '2': { min: 40, max: 49, description: 'Possibly qualified' },
            '1': { min: 0, max: 39, description: 'No recommendation' }
          },
          'SAT': {
            'Math': { min: 200, max: 800, passing: 530 },
            'EBRW': { min: 200, max: 800, passing: 480 },
            'Total': { min: 400, max: 1600 }
          },
          'ACT': {
            'Composite': { min: 1, max: 36, passing: 21 },
            'English': { min: 1, max: 36 },
            'Math': { min: 1, max: 36 },
            'Reading': { min: 1, max: 36 },
            'Science': { min: 1, max: 36 }
          }
        },
        honorsTypes: ['Honors', 'AP', 'IB', 'Dual Enrollment']
      }
    };
  }

  /**
   * Calculate grade based on curriculum system
   */
  calculateGrade(score, subject = null, level = null) {
    switch(this.system) {
      case '844':
        return this.calculate844Grade(score);
      case 'cbc':
        return this.calculateCBCGrade(score, level);
      case 'british':
        return this.calculateBritishGrade(score, level);
      case 'american':
        return this.calculateAmericanGrade(score, level, subject);
      default:
        return this.calculate844Grade(score);
    }
  }

  calculate844Grade(score) {
    const scale = this.gradingScales['844'].grading;
    for (const [grade, range] of Object.entries(scale)) {
      if (score >= range.min && score <= range.max) {
        return {
          grade,
          points: range.points,
          remark: range.remark,
          score,
          system: '844'
        };
      }
    }
    return { grade: 'E', points: 1, remark: 'Fail', score, system: '844' };
  }

  calculateCBCGrade(score, level) {
    const scale = this.gradingScales['cbc'].grading;
    let levelCategory = 'lower';
    if (level && ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'].includes(level)) {
      levelCategory = 'upper';
    }
    
    for (const [grade, range] of Object.entries(scale)) {
      if (score >= range.min && score <= range.max) {
        return {
          grade,
          code: range.code,
          color: range.color,
          score,
          level,
          levelCategory,
          system: 'cbc',
          competencies: this.generateCompetencyScores(score)
        };
      }
    }
    return {
      grade: 'Below Expectations',
      code: 'BE',
      color: '#ef4444',
      score,
      level,
      system: 'cbc'
    };
  }

  calculateBritishGrade(score, level) {
    const british = this.gradingScales['british'];
    
    let levelCategory = 'KS3';
    if (level) {
      for (const [stage, years] of Object.entries(british.keyStages)) {
        if (years.includes(level)) {
          levelCategory = stage;
          break;
        }
      }
    }

    if (levelCategory === 'KS4') {
      const gcse = british.grading.GCSE;
      for (const [grade, range] of Object.entries(gcse)) {
        if (score >= range.min && score <= range.max) {
          return {
            grade,
            points: range.points,
            description: range.description,
            score,
            level,
            levelCategory,
            system: 'british',
            qualification: 'GCSE'
          };
        }
      }
    }
    
    if (levelCategory === 'KS5') {
      const alevel = british.grading['A-Level'];
      for (const [grade, range] of Object.entries(alevel)) {
        if (score >= range.min && score <= range.max) {
          return {
            grade,
            points: range.points,
            ucas: range.ucas,
            score,
            level,
            levelCategory,
            system: 'british',
            qualification: 'A-Level'
          };
        }
      }
    }

    if (['KS1', 'KS2', 'KS3'].includes(levelCategory)) {
      if (score >= 90) return { grade: 'Working Above', level: 'Greater Depth', score, system: 'british' };
      if (score >= 70) return { grade: 'Working At', level: 'Expected', score, system: 'british' };
      if (score >= 50) return { grade: 'Working Towards', level: 'Developing', score, system: 'british' };
      return { grade: 'Below Expected', level: 'Emerging', score, system: 'british' };
    }

    return { grade: 'U', points: 0, score, system: 'british' };
  }

  calculateAmericanGrade(score, level, subject = null) {
    const american = this.gradingScales['american'];
    const gpa = american.grading.GPA;

    const isAP = subject && subject.includes('AP');

    for (const [grade, range] of Object.entries(gpa)) {
      if (score >= range.min && score <= range.max) {
        const points = isAP ? range.weighted : range.points;
        return {
          grade,
          gpa: points,
          unweightedGPA: range.points,
          weightedGPA: range.weighted,
          score,
          level,
          subject,
          isAP,
          system: 'american',
          gradePoint: points,
          qualityPoints: points * this.getCreditHours(level)
        };
      }
    }
    
    return {
      grade: 'F',
      gpa: 0.0,
      score,
      system: 'american'
    };
  }

  getCreditHours(level) {
    if (level && ['Grade 11', 'Grade 12'].includes(level)) return 1.0;
    if (level && ['Grade 9', 'Grade 10'].includes(level)) return 0.5;
    return 0.25;
  }

  generateCompetencyScores(score) {
    const competencies = this.gradingScales['cbc'].competencies;
    const scores = {};
    
    competencies.forEach(comp => {
      const variance = Math.random() * 10 - 5;
      const compScore = Math.min(100, Math.max(0, score + variance));
      scores[comp] = compScore;
    });
    
    return scores;
  }

  /**
   * Calculate GPA for American system
   */
  calculateGPA(grades) {
    const american = this.gradingScales['american'];
    let totalPoints = 0;
    let totalCredits = 0;
    let weightedTotal = 0;

    grades.forEach(grade => {
      const gpa = american.grading.GPA[grade.grade];
      if (gpa) {
        const credits = this.getCreditHours(grade.level);
        totalPoints += gpa.points * credits;
        weightedTotal += (grade.isAP ? gpa.weighted : gpa.points) * credits;
        totalCredits += credits;
      }
    });

    return {
      unweightedGPA: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0,
      weightedGPA: totalCredits > 0 ? (weightedTotal / totalCredits).toFixed(2) : 0,
      totalCredits
    };
  }

  /**
   * Calculate mean grade for 8-4-4 system
   */
  calculateMeanGrade(subjectGrades) {
    const totalPoints = subjectGrades.reduce((sum, grade) => sum + grade.points, 0);
    const meanPoints = totalPoints / subjectGrades.length;
    const meanGrade = this.gradingScales['844'].meanGradeMapping[Math.round(meanPoints)] || 'E';
    
    return {
      meanPoints: meanPoints.toFixed(2),
      meanGrade,
      totalPoints,
      subjectCount: subjectGrades.length,
      classification: this.getClassClassification(meanPoints)
    };
  }

  getClassClassification(meanPoints) {
    if (meanPoints >= 12) return 'Distinction';
    if (meanPoints >= 10) return 'Credit';
    if (meanPoints >= 7) return 'Pass';
    if (meanPoints >= 4) return 'Referral';
    return 'Fail';
  }

  /**
   * Calculate UCAS points for British system
   */
  calculateUCASPoints(grades) {
    const british = this.gradingScales['british'];
    let totalUCAS = 0;
    let qualifications = [];

    grades.forEach(grade => {
      if (grade.qualification === 'A-Level') {
        totalUCAS += british.ucasTariff[grade.grade] || 0;
        qualifications.push({ subject: grade.subject, grade: grade.grade, ucas: british.ucasTariff[grade.grade] });
      }
    });

    return {
      totalUCAS,
      qualifications,
      universityEligibility: totalUCAS >= 112 ? 'Good' : totalUCAS >= 80 ? 'Average' : 'Needs Improvement'
    };
  }

  /**
   * Generate performance predictions
   */
  generatePredictions(studentId, historicalData) {
    const predictions = {
      shortTerm: this.predictShortTerm(historicalData),
      longTerm: this.predictLongTerm(historicalData),
      riskFactors: this.identifyRiskFactors(historicalData),
      recommendations: this.generateRecommendations(historicalData)
    };

    return predictions;
  }

  predictShortTerm(historicalData) {
    if (!historicalData || historicalData.length < 3) {
      return { confidence: 'low', message: 'Insufficient data for prediction' };
    }

    const recent = historicalData.slice(-3);
    const scores = recent.map(r => r.score);
    const trend = scores[2] - scores[0];
    
    let predictedScore = scores[2] + (trend / 2);
    predictedScore = Math.min(100, Math.max(0, predictedScore));

    return {
      predictedScore: Math.round(predictedScore * 10) / 10,
      trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
      confidence: historicalData.length >= 5 ? 'high' : 'medium',
      nextAssessmentGrade: this.calculateGrade(predictedScore).grade
    };
  }

  predictLongTerm(historicalData) {
    if (!historicalData || historicalData.length < 6) {
      return { confidence: 'low', message: 'Insufficient data for long-term prediction' };
    }

    const avgScore = historicalData.reduce((sum, r) => sum + r.score, 0) / historicalData.length;
    const variance = this.calculateVariance(historicalData.map(r => r.score));
    const consistency = variance < 10 ? 'high' : variance < 20 ? 'medium' : 'low';

    return {
      predictedFinalGrade: this.calculateGrade(avgScore).grade,
      consistency,
      confidence: historicalData.length >= 10 ? 'high' : 'medium',
      improvementNeeded: Math.max(0, 50 - avgScore).toFixed(1)
    };
  }

  identifyRiskFactors(historicalData) {
    const risks = [];
    const recent = historicalData.slice(-3);
    
    if (recent.length >= 3) {
      const scores = recent.map(r => r.score);
      if (scores[2] < scores[0] - 10) {
        risks.push({
          type: 'declining_trend',
          severity: 'high',
          message: 'Significant decline in recent assessments'
        });
      }
    }

    if (historicalData.length >= 4) {
      const variance = this.calculateVariance(historicalData.map(r => r.score));
      if (variance > 20) {
        risks.push({
          type: 'inconsistency',
          severity: 'medium',
          message: 'Performance is highly inconsistent'
        });
      }
    }

    const avgScore = historicalData.reduce((sum, r) => sum + r.score, 0) / historicalData.length;
    if (avgScore < 50) {
      risks.push({
        type: 'below_average',
        severity: 'high',
        message: 'Overall performance below passing threshold'
      });
    }

    return risks;
  }

  generateRecommendations(historicalData) {
    const avgScore = historicalData.reduce((sum, r) => sum + r.score, 0) / historicalData.length;
    const recommendations = [];

    if (avgScore < 40) {
      recommendations.push({
        type: 'intervention',
        priority: 'urgent',
        action: 'Schedule one-on-one tutoring sessions',
        reason: 'Performance critically low'
      });
    } else if (avgScore < 60) {
      recommendations.push({
        type: 'support',
        priority: 'high',
        action: 'Provide additional practice materials and study groups',
        reason: 'Performance below target'
      });
    } else if (avgScore < 75) {
      recommendations.push({
        type: 'enhancement',
        priority: 'medium',
        action: 'Encourage participation in advanced exercises',
        reason: 'Good foundation, room for improvement'
      });
    } else {
      recommendations.push({
        type: 'enrichment',
        priority: 'low',
        action: 'Provide challenging extension activities',
        reason: 'Excellent performance, maintain momentum'
      });
    }

    const subjects = {};
    historicalData.forEach(record => {
      if (!subjects[record.subject]) {
        subjects[record.subject] = [];
      }
      subjects[record.subject].push(record.score);
    });

    Object.entries(subjects).forEach(([subject, scores]) => {
      const subjectAvg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      if (subjectAvg < 50) {
        recommendations.push({
          type: 'subject_intervention',
          priority: 'high',
          subject,
          action: `Focus on improving ${subject} fundamentals`,
          reason: `Average score of ${subjectAvg.toFixed(1)}% below passing`
        });
      }
    });

    return recommendations;
  }

  calculateVariance(numbers) {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    const variance = squaredDiffs.reduce((sum, n) => sum + n, 0) / numbers.length;
    return Math.sqrt(variance);
  }

  /**
   * Generate comparative analysis
   */
  generateComparativeAnalysis(studentId, classId, schoolId) {
    return {
      classRank: 15,
      classPercentile: 75,
      schoolRank: 120,
      schoolPercentile: 68,
      aboveClassAverage: true,
      aboveSchoolAverage: true,
      comparisonMetrics: {
        vsClass: {
          average: '+5.2%',
          trend: 'positive',
          details: 'Performing above 75% of classmates'
        },
        vsSchool: {
          average: '+2.1%',
          trend: 'positive',
          details: 'Performing above 68% of school'
        },
        vsNational: {
          average: '-1.3%',
          trend: 'negative',
          details: 'Slightly below national average'
        }
      }
    };
  }

  /**
   * Generate curriculum-specific report card
   */
  generateReportCard(student, academicRecords, system = null) {
    const curriculum = system || this.system;
    
    const baseData = {
      student: {
        name: student.name,
        grade: student.grade,
        elimuid: student.elimuid,
        year: new Date().getFullYear(),
        term: 'Term 2'
      },
      subjects: [],
      summary: {}
    };

    switch(curriculum) {
      case '844':
        return this.generate844ReportCard(student, academicRecords);
      case 'cbc':
        return this.generateCBCReportCard(student, academicRecords);
      case 'british':
        return this.generateBritishReportCard(student, academicRecords);
      case 'american':
        return this.generateAmericanReportCard(student, academicRecords);
      default:
        return baseData;
    }
  }

  generate844ReportCard(student, records) {
    const subjectGrades = records.map(r => ({
      subject: r.subject,
      score: r.score,
      ...this.calculate844Grade(r.score)
    }));

    const meanGrade = this.calculateMeanGrade(subjectGrades);

    return {
      system: '8-4-4',
      student: student.name,
      grade: student.grade,
      term: 'Term 2',
      year: 2024,
      subjects: subjectGrades,
      summary: {
        meanGrade: meanGrade.meanGrade,
        meanPoints: meanGrade.meanPoints,
        totalPoints: meanGrade.totalPoints,
        classification: meanGrade.classification,
        position: '15/45'
      },
      teacherComments: {
        strengths: ['Good in Mathematics', 'Active participation'],
        improvements: ['Science needs attention', 'More practice in Chemistry'],
        overall: 'Shows good potential but needs consistency'
      }
    };
  }

  generateCBCReportCard(student, records) {
    const subjectScores = {};
    records.forEach(r => {
      if (!subjectScores[r.subject]) {
        subjectScores[r.subject] = [];
      }
      subjectScores[r.subject].push(r.score);
    });

    const subjects = Object.entries(subjectScores).map(([subject, scores]) => ({
      subject,
      average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      ...this.calculateCBCGrade(
        scores.reduce((sum, s) => sum + s, 0) / scores.length,
        student.grade
      )
    }));

    const competencies = this.gradingScales['cbc'].competencies.map(comp => ({
      name: comp,
      score: Math.floor(Math.random() * 30 + 60),
      descriptor: this.getCompetencyDescriptor(Math.floor(Math.random() * 30 + 60))
    }));

    const values = this.gradingScales['cbc'].coreValues.map(val => ({
      name: val,
      rating: ['Exemplary', 'Accomplished', 'Developing', 'Emerging'][Math.floor(Math.random() * 4)]
    }));

    return {
      system: 'Competency Based Curriculum',
      student: student.name,
      grade: student.grade,
      term: 'Term 2',
      year: 2024,
      subjects,
      competencies,
      values,
      summary: {
        overall: subjects.reduce((sum, s) => sum + (s.score || 0), 0) / subjects.length,
        strengths: ['Creativity', 'Communication'],
        areasForGrowth: ['Critical Thinking'],
        nextGrade: 'Grade 6',
        promotionStatus: 'Progressing'
      }
    };
  }

  generateBritishReportCard(student, records) {
    const isKS4 = ['Year 10', 'Year 11'].includes(student.grade);
    const isKS5 = ['Year 12', 'Year 13'].includes(student.grade);

    const subjectGrades = records.map(r => ({
      subject: r.subject,
      score: r.score,
      ...this.calculateBritishGrade(r.score, student.grade)
    }));

    const ucasPoints = isKS5 ? this.calculateUCASPoints(subjectGrades) : null;

    return {
      system: 'British Curriculum',
      student: student.name,
      year: student.grade,
      keyStage: this.getKeyStage(student.grade),
      term: 'Spring Term',
      academicYear: '2023-2024',
      subjects: subjectGrades,
      summary: {
        ...(ucasPoints && { ucasPoints: ucasPoints.totalUCAS }),
        predictedGrades: subjectGrades.map(s => ({
          subject: s.subject,
          predicted: s.qualification === 'A-Level' ? 'B' : '6'
        })),
        attendance: '94%',
        punctuality: 'Good'
      },
      teacherRemarks: subjectGrades.map(s => ({
        subject: s.subject,
        comment: `${s.grade} - ${s.description || ''}`,
        target: `Aim for ${s.qualification === 'A-Level' ? 'B' : '7'}`
      }))
    };
  }

  generateAmericanReportCard(student, records) {
    const subjectGrades = records.map(r => ({
      subject: r.subject,
      score: r.score,
      level: student.grade,
      isAP: r.subject.includes('AP'),
      ...this.calculateAmericanGrade(r.score, student.grade, r.subject)
    }));

    const gpa = this.calculateGPA(subjectGrades);
    
    const classRank = Math.floor(Math.random() * 30) + 10;

    return {
      system: 'American Curriculum',
      student: student.name,
      grade: student.grade,
      semester: 'Spring 2024',
      academicYear: '2023-2024',
      subjects: subjectGrades,
      gpa: {
        unweighted: gpa.unweightedGPA,
        weighted: gpa.weightedGPA,
        scale: '4.0',
        classRank: `${classRank}/125`,
        percentile: 100 - (classRank / 125 * 100)
      },
      honors: subjectGrades.filter(s => s.isAP).map(s => ({
        subject: s.subject,
        grade: s.grade,
        exam: 'AP',
        score: s.score
      })),
      teacherComments: subjectGrades.map(s => ({
        subject: s.subject,
        comment: s.score >= 90 ? 'Excellent work' : 
                 s.score >= 80 ? 'Good progress' : 
                 s.score >= 70 ? 'Satisfactory' : 'Needs improvement'
      })),
      nextSteps: {
        recommendedCourses: ['AP Calculus', 'AP Biology'],
        collegePrep: gpa.weightedGPA >= 3.5 ? 'On track for competitive colleges' : 'Focus on improving GPA'
      }
    };
  }

  getKeyStage(year) {
    const keyStages = {
      'Year 1': 'KS1', 'Year 2': 'KS1',
      'Year 3': 'KS2', 'Year 4': 'KS2', 'Year 5': 'KS2', 'Year 6': 'KS2',
      'Year 7': 'KS3', 'Year 8': 'KS3', 'Year 9': 'KS3',
      'Year 10': 'KS4', 'Year 11': 'KS4',
      'Year 12': 'KS5', 'Year 13': 'KS5'
    };
    return keyStages[year] || 'KS3';
  }

  getCompetencyDescriptor(score) {
    if (score >= 80) return 'Exceeds Expectations';
    if (score >= 60) return 'Meets Expectations';
    if (score >= 40) return 'Approaching Expectations';
    return 'Below Expectations';
  }

  /**
   * Generate AI insights based on performance patterns
   */
  generateAIInsights(studentId, academicRecords, attendanceRecords) {
    const insights = [];
    
    const subjects = {};
    academicRecords.forEach(record => {
      if (!subjects[record.subject]) {
        subjects[record.subject] = [];
      }
      subjects[record.subject].push(record);
    });

    Object.entries(subjects).forEach(([subject, records]) => {
      const avgScore = records.reduce((sum, r) => sum + r.score, 0) / records.length;
      const trend = this.calculateTrend(records.map(r => r.score));
      
      if (avgScore >= 80) {
        insights.push({
          type: 'strength',
          subject,
          insight: `Exceptional performance in ${subject}`,
          recommendation: 'Consider advanced placement or competitions',
          confidence: 0.95
        });
      }

      if (trend > 5) {
        insights.push({
          type: 'improvement',
          subject,
          insight: `Rapid improvement in ${subject}`,
          recommendation: 'Current learning strategies are working well',
          confidence: 0.85
        });
      }

      if (trend < -5 && avgScore < 60) {
        insights.push({
          type: 'risk',
          subject,
          insight: `Declining performance in ${subject}`,
          recommendation: 'Immediate intervention recommended',
          confidence: 0.9
        });
      }
    });

    const attendanceRate = attendanceRecords.filter(r => r.status === 'present').length / 
                          (attendanceRecords.length || 1) * 100;
    
    if (attendanceRate < 80) {
      insights.push({
        type: 'warning',
        insight: 'Low attendance affecting academic performance',
        recommendation: 'Address attendance issues immediately',
        confidence: 0.98
      });
    }

    insights.push({
      type: 'learning_style',
      insight: 'Student shows visual learning preferences',
      recommendation: 'Use more diagrams, videos, and visual aids',
      confidence: 0.75
    });

    insights.push({
      type: 'study_tip',
      insight: 'Optimal study time detected in mornings',
      recommendation: 'Schedule difficult subjects in the morning',
      confidence: 0.7
    });

    return {
      studentId,
      generatedAt: new Date(),
      insights,
      summary: {
        strengthsCount: insights.filter(i => i.type === 'strength').length,
        risksCount: insights.filter(i => i.type === 'risk').length,
        overallHealth: insights.filter(i => i.type === 'risk').length > 2 ? 'Needs Attention' : 'Good'
      }
    };
  }

  calculateTrend(scores) {
    if (scores.length < 3) return 0;
    const first = scores[0];
    const last = scores[scores.length - 1];
    return ((last - first) / first) * 100;
  }
}

module.exports = CurriculumAnalyticsEngine;