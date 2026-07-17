const nodemailer = require('nodemailer');

const isEmailConfigured = !!(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
);

let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const sendEmail = async ({ to, subject, text, html }) => {
  if (isEmailConfigured && transporter) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"SHOPEZ Support" <support@shopez.com>',
        to,
        subject,
        text,
        html,
      };
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Nodemailer email sending failed:', error);
    }
  }

  // Fallback: simulation logging
  console.log('\n--- [EMAIL SIMULATION] ---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body (Text):\n${text}`);
  console.log('---------------------------\n');
  return { mock: true, messageId: `mock_email_${Date.now()}` };
};

module.exports = { sendEmail, isEmailConfigured };
