'use strict';

const nodemailer = require('nodemailer');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createTransporter() {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

async function sendNotificationEmail({ name, email, subject, message }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.info('[Mailer] Credentials not configured — skipping notification.');
    return;
  }

  const notifyTo = process.env.NOTIFY_EMAIL || process.env.EMAIL_USER;

  await transporter.sendMail({
    from: `"MIR Portfolio" <${process.env.EMAIL_USER}>`,
    to: notifyTo,
    subject: `[Portfolio] New Contact: ${subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;
                  background:#0b1120;color:#fff;border-radius:12px;">
        <h2 style="color:#ffc107;margin-top:0;">New Contact Message</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#94a3b8;width:90px;vertical-align:top;">Name</td>
            <td style="padding:8px 0;font-weight:600;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Email</td>
            <td style="padding:8px 0;">
              <a href="mailto:${escapeHtml(email)}" style="color:#ffc107;">${escapeHtml(email)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Subject</td>
            <td style="padding:8px 0;">${escapeHtml(subject)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Message</td>
            <td style="padding:8px 0;white-space:pre-wrap;">${escapeHtml(message)}</td>
          </tr>
        </table>
        <p style="margin-top:24px;color:#64748b;font-size:0.8rem;">
          Sent via MIR Portfolio contact form
        </p>
      </div>
    `,
  });
}

module.exports = { sendNotificationEmail };
