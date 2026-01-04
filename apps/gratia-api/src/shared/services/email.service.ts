import nodemailer from "nodemailer";
import { EmailMessage, EmailResult } from "../types";

const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "gmail";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM;

if (!EMAIL_USER) {
  throw new Error("EMAIL_USER is not set");
}

if (!EMAIL_PASSWORD) {
  throw new Error("EMAIL_PASSWORD is not set");
}

if (!EMAIL_FROM) {
  throw new Error("EMAIL_FROM is not set");
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export const initializeEmailService = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log("Email service is ready to send emails");
  } catch (error) {
    console.error("Email service verification failed:", error);
    throw new Error("Failed to initialize email service");
  }
};

export const sendMail = async (message: EmailMessage): Promise<EmailResult> => {
  try {
    console.log("Sending email to:", message.to);

    const result = await transporter.sendMail({
      from: EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    console.log("Email sent successfully. MessageId:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
