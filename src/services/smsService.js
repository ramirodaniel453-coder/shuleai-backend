const twilio = require('twilio');

let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

const sendSMS = async ({ to, message }) => {
  try {
    if (!client) {
      console.log('SMS client not configured. Would send:', message);
      return { success: true, simulated: true };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log('SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS error:', error);
    throw error;
  }
};

const sendBulkSMS = async ({ recipients, message }) => {
  try {
    const results = await Promise.allSettled(
      recipients.map(to => sendSMS({ to, message }))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: true,
      total: recipients.length,
      successful,
      failed
    };
  } catch (error) {
    console.error('Bulk SMS error:', error);
    throw error;
  }
};

module.exports = { sendSMS, sendBulkSMS };