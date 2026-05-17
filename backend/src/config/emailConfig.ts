
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_PASS,
  NODE_ENV,
} = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn(
    '[emailConfig] EMAIL_USER or EMAIL_PASS is missing. OTP emails will fail until these are configured.',
  );
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST || 'smtp.gmail.com',
  port: EMAIL_PORT ? Number(EMAIL_PORT) : 587,
  secure: EMAIL_SECURE ? EMAIL_SECURE === 'true' : false,
  auth: EMAIL_USER && EMAIL_PASS ? { user: EMAIL_USER, pass: EMAIL_PASS } : undefined,
});

if (NODE_ENV !== 'test') {
  transporter
    .verify()
    .then(() => console.log('[emailConfig] Email transporter verified.'))
    .catch((error) => {
      console.error('[emailConfig] Failed to verify transporter:', error);
    });
}

export default transporter;
