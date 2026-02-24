const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const templates = {
  welcome: (data) => ({
    subject: 'Welcome to ShuleAI!',
    html: `
      <h1>Welcome to ShuleAI, ${data.name}!</h1>
      <p>Your account has been created as a ${data.role} at ${data.schoolName}.</p>
      <p>You can now log in to access your dashboard.</p>
      <p><a href="${data.loginLink}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Dashboard</a></p>
      <p>Best regards,<br>ShuleAI Team</p>
    `
  }),
  
  'teacher-welcome': (data) => ({
    subject: 'Welcome to ShuleAI - Account Approved!',
    html: `
      <h1>Welcome to ShuleAI, ${data.name}!</h1>
      <p>Your teacher account has been approved by ${data.schoolName}.</p>
      <p>You can now log in to access your teacher dashboard.</p>
      <p><a href="${data.loginLink}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Dashboard</a></p>
      <p>Best regards,<br>ShuleAI Team</p>
    `
  }),
  
  'teacher-rejection': (data) => ({
    subject: 'Update on Your ShuleAI Application',
    html: `
      <h1>Application Update</h1>
      <p>Dear ${data.name},</p>
      <p>Your application to join ${data.schoolName} as a teacher has been reviewed.</p>
      <p><strong>Status:</strong> Not approved at this time</p>
      ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
      <p>If you have questions, please contact the school directly at ${data.supportEmail}.</p>
      <p>Thank you for your interest in ShuleAI.</p>
    `
  }),
  
  'approval-request': (data) => ({
    subject: 'New Teacher Signup Pending Approval',
    html: `
      <h1>New Teacher Signup</h1>
      <p>${data.teacherName} has requested to join ${data.schoolName} as a teacher.</p>
      <p><a href="${data.approvalLink}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Application</a></p>
    `
  }),
  
  'duty-assignment': (data) => ({
    subject: 'Duty Assignment Notification',
    html: `
      <h1>Duty Assignment</h1>
      <p>Dear ${data.name},</p>
      <p>You have been assigned to duty on:</p>
      <ul>
        <li><strong>Date:</strong> ${data.date}</li>
        <li><strong>Type:</strong> ${data.dutyType}</li>
        <li><strong>Area:</strong> ${data.area}</li>
        <li><strong>Time:</strong> ${data.timeSlot}</li>
      </ul>
      <p>Please check your dashboard for more details.</p>
      <p><a href="${data.calendarLink}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Add to Calendar</a></p>
    `
  }),
  
  'password-reset': (data) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Hi ${data.name},</p>
      <p>You requested to reset your password. Click the link below:</p>
      <p><a href="${data.resetLink}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  }),
  
  'payment-confirmation': (data) => ({
    subject: 'Payment Confirmed',
    html: `
      <h1>Payment Successful!</h1>
      <p>Dear ${data.parentName},</p>
      <p>Your payment of KES ${data.amount} for ${data.studentName} has been confirmed.</p>
      <p><strong>Reference:</strong> ${data.reference}</p>
      <p>Thank you for choosing ShuleAI!</p>
    `
  })
};

const sendEmail = async ({ to, subject, template, data }) => {
  try {
    let emailContent;
    
    if (template && templates[template]) {
      emailContent = templates[template](data);
      subject = emailContent.subject;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: subject || 'ShuleAI Notification',
      html: emailContent ? emailContent.html : data.message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

module.exports = { sendEmail };