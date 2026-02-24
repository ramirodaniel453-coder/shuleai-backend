const { Alert, User } = require('../models');
const { sendEmail } = require('./emailService');
const { sendSMS } = require('./smsService');

const createAlert = async ({
  userId,
  role,
  type,
  severity,
  title,
  message,
  data = {}
}) => {
  try {
    const alert = await Alert.create({
      userId,
      role,
      type,
      severity,
      title,
      message,
      data
    });

    const user = await User.findByPk(userId);

    if (user && user.email && user.preferences?.notifications?.email) {
      await sendEmail({
        to: user.email,
        template: 'alert-notification',
        data: { title, message }
      }).catch(e => console.error('Email notification failed:', e));
    }

    if (process.env.NODE_ENV === 'production' && 
        user && user.phone && 
        user.preferences?.notifications?.sms) {
      await sendSMS({
        to: user.phone,
        message: `${title}: ${message}`
      }).catch(e => console.error('SMS notification failed:', e));
    }

    if (global.io) {
      global.io.to(`user-${userId}`).emit('alert', alert);
    }

    return alert;
  } catch (error) {
    console.error('Alert creation error:', error);
    return null;
  }
};

const createBulkAlerts = async (alerts) => {
  try {
    const results = await Promise.allSettled(
      alerts.map(alert => createAlert(alert))
    );

    return {
      total: alerts.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };
  } catch (error) {
    console.error('Bulk alert creation error:', error);
    throw error;
  }
};

const sendDutyReminders = async (dutyRoster) => {
  try {
    const reminders = [];
    
    for (const duty of dutyRoster.duties) {
      const teacher = await User.findByPk(duty.teacherId);
      
      if (teacher && teacher.phone) {
        reminders.push({
          to: teacher.phone,
          message: `Reminder: You have ${duty.type} duty today at ${duty.area} from ${duty.timeSlot.start} to ${duty.timeSlot.end}`
        });
      }
    }

    if (reminders.length > 0) {
      await sendBulkSMS({ recipients: reminders.map(r => r.to), message: reminders[0].message });
    }

    return { success: true, count: reminders.length };
  } catch (error) {
    console.error('Duty reminder error:', error);
    throw error;
  }
};

module.exports = {
  createAlert,
  createBulkAlerts,
  sendDutyReminders
};