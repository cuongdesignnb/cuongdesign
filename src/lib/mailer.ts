import nodemailer from "nodemailer";
import { prisma } from "./db";

export async function getTransporter() {
  // Query SMTP configurations from database settings
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from"],
      },
    },
  });

  const smtpConfig: Record<string, string> = {};
  settings.forEach((s) => {
    smtpConfig[s.key] = s.value;
  });

  // Load configs with fallbacks to environment variables
  const host = smtpConfig["smtp_host"] || process.env.SMTP_HOST || "";
  const port = parseInt(smtpConfig["smtp_port"] || process.env.SMTP_PORT || "587");
  const user = smtpConfig["smtp_user"] || process.env.SMTP_USER || "";
  const pass = smtpConfig["smtp_pass"] || process.env.SMTP_PASS || "";
  const from = smtpConfig["smtp_from"] || process.env.SMTP_FROM || `"CUONG DESIGN" <noreply@cuongdesign.com>`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // Use SSL/TLS for port 465
    auth: {
      user,
      pass,
    },
  });

  return { transporter, from };
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { transporter, from } = await getTransporter();
    
    // Check if configuration is present
    if (!(transporter.options as any).host) {
      console.warn("SMTP email host is not configured yet. Skipping send.");
      return null;
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("Email đã được gửi thành công:", info.messageId);
    return info;
  } catch (error) {
    console.error("Lỗi gửi email hệ thống:", error);
    throw error;
  }
}
