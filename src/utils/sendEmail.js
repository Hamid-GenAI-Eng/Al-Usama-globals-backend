const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if SMTP environment variables are present
  const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Al-Usama Logistics'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to ${options.email} via SMTP. Message ID: ${info.messageId}`);
      return { sent: true, method: 'smtp', messageId: info.messageId };
    } catch (error) {
      console.error(`Error sending email via SMTP to ${options.email}:`, error);
      throw error;
    }
  } else {
    console.log('---------------- EMAIL MOCK ----------------');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('---------------------------------------------');
    return { sent: false, method: 'mock', resetUrl: options.resetUrl };
  }
};

module.exports = sendEmail;
