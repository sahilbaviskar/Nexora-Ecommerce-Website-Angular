import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<string | null> {
  const transporter = createTransporter();

  if (!transporter) {
    // No SMTP configured — log to console for development
    console.log(`\n========================================`);
    console.log(`[Password Reset] Email: ${to}`);
    console.log(`[Password Reset] Link:  ${resetUrl}`);
    console.log(`========================================\n`);
    return resetUrl; // returned so controller can pass it to the frontend in dev
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: `"Nexora" <${from}>`,
      to,
      subject: 'Reset your Nexora password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="font-size:22px;font-weight:700;margin-bottom:8px;">Reset your password</h2>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            We received a request to reset the password for your Nexora account.
            Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;margin:24px 0;padding:12px 28px;background:#000;color:#fff;border-radius:50px;text-decoration:none;font-size:14px;font-weight:600;">
            Reset Password
          </a>
          <p style="color:#999;font-size:12px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `
    });
    return null;
  } catch (err: any) {
    // SMTP send failed — fall back to console so the app doesn't crash
    console.error(`[Mailer] Failed to send email: ${err.message}`);
    console.log(`\n========================================`);
    console.log(`[Password Reset] Email: ${to}`);
    console.log(`[Password Reset] Link:  ${resetUrl}`);
    console.log(`========================================\n`);
    return resetUrl;
  }
}
