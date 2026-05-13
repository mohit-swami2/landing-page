import nodemailer from "nodemailer";
import { EmailTemplate } from "../models/EmailTemplate.js";

function getTransporter() {
  if (!process.env.SMTP_HOST) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined
  });
}

export async function sendTemplatedEmail({ to, key, data }) {
  const template = await EmailTemplate.findOne({ key });
  if (!template) return;

  let html = template.html;
  Object.entries(data).forEach(([k, v]) => {
    html = html.replaceAll(`{{${k}}}`, String(v));
  });

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[email-preview:${key}] to=${to}`);
    console.log(html);
    return;
  }

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      process.env.EMAIL_FROM ||
      "no-reply@landing-page.local",
    to,
    subject: template.subject,
    html
  });

  console.log(`[email:${key}] delivered to=${to}`);
}
