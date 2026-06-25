import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || 'noreply@precisionfinance.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const isConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${FRONTEND_URL}?reset_token=${token}`;

  if (!isConfigured || !transporter) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  EMAIL NOT CONFIGURED - Password reset link below:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  To: ${to}`);
    console.log(`  Reset URL: ${resetUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { sent: false, logged: true, resetUrl };
  }

  await transporter.sendMail({
    from: `Precision Finance <${FROM_EMAIL}>`,
    to,
    subject: 'Password Reset Request',
    text: `You requested a password reset.\n\nClick this link to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #ef4444;">Password Reset</h2>
        <p>You requested a password reset for your Precision Finance account.</p>
        <p><a href="${resetUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">Reset Password</a></p>
        <p style="color: #666; font-size: 13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Precision Finance</p>
      </div>
    `,
  });

  return { sent: true, logged: false, resetUrl };
}

export function getEmailStatus() {
  return { isConfigured, from: FROM_EMAIL };
}
