const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

const sendStatusEmail = async (studentEmail, studentName, jobTitle, status, assignment = null) => {
  let subject;
  let html;

  if (status === 'selected') {
    subject = `Congratulations! You've been selected for ${jobTitle}`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Congratulations ${studentName}!</h2>
        <p>You have been <strong>SELECTED</strong> for <strong>${jobTitle}</strong>.</p>
        ${assignment ? `<p><strong>Assignment:</strong> ${assignment.title}</p>` : ''}
      </div>
    `;
  } else {
    subject = `Update on your application for ${jobTitle}`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Hello ${studentName},</h2>
        <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
      </div>
    `;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'JobPortal <noreply@jobportal.com>',
      to: studentEmail,
      subject,
      html
    });
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }
};

module.exports = { sendStatusEmail };
