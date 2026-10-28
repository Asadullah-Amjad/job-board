import nodemailer from "nodemailer";
import { AppError } from "@/lib/errors";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendEmail(message: EmailMessage) {
  const provider = process.env.AUTH_EMAIL_PROVIDER ?? "resend";
  const from = process.env.AUTH_EMAIL_FROM;

  if (!from) {
    throw new AppError("EMAIL_DELIVERY_FAILED", "Email delivery is temporarily unavailable.");
  }

  if (provider === "smtp") {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? "2525");
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;

    if (!host || !Number.isInteger(port) || !user || !password) {
      throw new AppError("EMAIL_DELIVERY_FAILED", "Email delivery is temporarily unavailable.");
    }

    try {
      const transport = nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user, pass: password },
      });

      await transport.sendMail({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      return;
    } catch (error) {
      throw new AppError("EMAIL_DELIVERY_FAILED", "Email delivery is temporarily unavailable.", 503, { cause: error });
    }
  }

  const apiKey = provider === "mailtrap" ? process.env.MAILTRAP_API_TOKEN : process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new AppError("EMAIL_DELIVERY_FAILED", "Email delivery is temporarily unavailable.");
  }

  const fromEmail = from.match(/<([^>]+)>/)?.[1] ?? from;
  const response = await fetch(
    provider === "mailtrap" ? "https://send.api.mailtrap.io/api/send" : "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        provider === "mailtrap"
          ? {
              from: { email: fromEmail },
              to: [{ email: message.to }],
              subject: message.subject,
              text: message.text,
              html: message.html,
            }
          : { from, ...message },
      ),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new AppError("EMAIL_DELIVERY_FAILED", "Email delivery is temporarily unavailable.", 503, { cause: body });
  }
}

export function verificationEmail(code: string) {
  return {
    subject: "Verify your JobHive account",
    text: `Your JobHive verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your JobHive verification code is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p>`,
  };
}

export function resetEmail(code: string) {
  return {
    subject: "Reset your JobHive password",
    text: `Your JobHive password reset code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your JobHive password reset code is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p>`,
  };
}
