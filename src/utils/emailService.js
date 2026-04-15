const nodemailer = require('nodemailer');

const useGmail = process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('your_gmail');

let transporter;
let transporterReady = false;

const getTransporter = async () => {
  if (transporterReady) return transporter;
  if (useGmail) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('📧 Ethereal account:', testAccount.user);
  }
  transporterReady = true;
  return transporter;
};

const sendResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const transport = await getTransporter();

  const from = useGmail ? `"HealthCare+" <${process.env.EMAIL_USER}>` : '"HealthCare+" <noreply@healthcare.com>';

  const info = await transport.sendMail({
    from,
    to: toEmail,
    subject: 'Reset Your Password — HealthCare+',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #2563eb;">HealthCare+ Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <p>This link expires in <strong>15 minutes</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block; margin: 16px 0; padding: 12px 24px; background:#2563eb; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">
          Reset Password
        </a>
        <p style="color:#6b7280; font-size:13px;">If you didn't request this, ignore this email. Your password won't change.</p>
      </div>
    `,
  });

  const previewUrl = !useGmail ? nodemailer.getTestMessageUrl(info) : null;
  if (previewUrl) console.log('🔗 Preview URL:', previewUrl);
  return previewUrl;
};

const sendAppointmentEmail = async ({ toEmail, patientName, doctorName, date, timeSlot, status, reason }) => {
  const statusMessages = {
    confirmed: { subject: 'Appointment Confirmed ✅', color: '#16a34a', heading: 'Appointment Confirmed!', body: `Your appointment with <strong>Dr. ${doctorName}</strong> has been confirmed.` },
    cancelled: { subject: 'Appointment Cancelled ❌', color: '#dc2626', heading: 'Appointment Cancelled', body: `Your appointment with <strong>Dr. ${doctorName}</strong> has been cancelled.` },
    rescheduled: { subject: 'Appointment Rescheduled 📅', color: '#2563eb', heading: 'Appointment Rescheduled', body: `Your appointment with <strong>Dr. ${doctorName}</strong> has been rescheduled.` },
    booked: { subject: 'Appointment Booked 🏥', color: '#2563eb', heading: 'Appointment Booked!', body: `Your appointment with <strong>Dr. ${doctorName}</strong> has been booked successfully.` },
  };
  const msg = statusMessages[status] || statusMessages.booked;
  await transporter.sendMail({
    from: `"HealthCare+" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: msg.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:${msg.color};">${msg.heading}</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>${msg.body}</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;">📅 <strong>Date:</strong> ${new Date(date).toLocaleDateString('en-IN')}</p>
          <p style="margin:4px 0;">🕐 <strong>Time:</strong> ${timeSlot}</p>
          ${reason ? `<p style="margin:4px 0;">📋 <strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        <p style="color:#6b7280;font-size:13px;">Please arrive 10 minutes early. For queries, contact the hospital.</p>
      </div>
    `,
  });
};

module.exports = { sendResetEmail, sendAppointmentEmail };
