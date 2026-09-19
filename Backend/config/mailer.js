import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

/**
 * 📬 Universal SMTP Transporter
 * Works seamlessly with Brevo (port 2525 on DigitalOcean), Gmail, or any custom SMTP relay.
 */
export const getSmtpTransporter = () => {
  const host = process.env.EMAIL_HOST || (process.env.EMAIL_USER?.includes("@gmail.com") ? "smtp.gmail.com" : "smtp-relay.brevo.com");
  const port = Number(process.env.EMAIL_PORT) || (host.includes("brevo") ? 2525 : 587);
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: (process.env.EMAIL_PASS || "").replace(/\s+/g, ""),
    },
  });
};

/**
 * 📧 Resolves the formatted 'From' sender address
 */
export const getFromAddress = () => {
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM.includes("<")
      ? process.env.EMAIL_FROM
      : `"Sowmiya Foods" <${process.env.EMAIL_FROM}>`;
  }
  return `"Sowmiya Foods" <${process.env.EMAIL_USER || "info@sowmiyafoods.com"}>`;
};

export default getSmtpTransporter;
