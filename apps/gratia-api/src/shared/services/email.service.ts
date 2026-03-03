import { Resend } from "resend";
import { EmailMessage, EmailResult } from "../types";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

if (!EMAIL_FROM) {
  throw new Error("EMAIL_FROM is not set");
}

const resend = new Resend(RESEND_API_KEY);

export const initializeEmailService = async (): Promise<void> => {
  console.log("Email service initialized with Resend");
};

export const sendMail = async (message: EmailMessage): Promise<EmailResult> => {
  try {
    console.log("Sending email to:", message.to);

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    if (error) {
      console.error("Email sending failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("Email sent successfully. MessageId:", data?.id);

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
