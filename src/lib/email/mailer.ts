import nodemailer from "nodemailer";
import { AppError } from "@/lib/errors";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendEmail(message: EmailMessage) {
  const provider = process.env.AUTH_EMAIL_PROVIDER ?? "gmail";

  if (provider === "smtp" || provider === "gmail") {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? (provider === "gmail" ? "587" : "2525"));
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD?.replace(/\s+/g, "");
    if (!host || !Number.isInteger(port) || !user || !password) {
      throw new AppError("EMAIL_DELIVERY_FAILED", "Email delivery is temporarily unavailable.");
    }
    const from = process.env.AUTH_EMAIL_FROM?.includes(user) ? process.env.AUTH_EMAIL_FROM : `JobHive <${user}>`;

    try {
      const transport = nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user, pass: password },
      });
      await transport.sendMail({ from, to: message.to, subject: message.subject, text: message.text, html: message.html });
      return;
    } catch (error) {
      throw new AppError("EMAIL_DELIVERY_FAILED", "Email delivery is temporarily unavailable.", 503, { cause: error });
    }
  }

  const from = process.env.AUTH_EMAIL_FROM;
  if (!from) throw new AppError("EMAIL_DELIVERY_FAILED", "Email delivery is temporarily unavailable.");
  const apiKey = provider === "mailtrap" ? process.env.MAILTRAP_API_TOKEN : process.env.RESEND_API_KEY;
  if (!apiKey) throw new AppError("EMAIL_DELIVERY_FAILED", "Email delivery is temporarily unavailable.");
  const fromEmail = from.match(/<([^>]+)>/)?.[1] ?? from;
  const response = await fetch(provider === "mailtrap" ? "https://send.api.mailtrap.io/api/send" : "https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(provider === "mailtrap"
      ? { from: { email: fromEmail }, to: [{ email: message.to }], subject: message.subject, text: message.text, html: message.html }
      : { from, ...message }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new AppError("EMAIL_DELIVERY_FAILED", "Email delivery is temporarily unavailable.", 503, { cause: body });
  }
}

export function verificationEmail(code: string) {
  return {
    subject: "Your JobHive verification code",
    text: `Welcome to JobHive.\n\nYour verification code is ${code}.\n\nThis code expires in 10 minutes. If you did not create this account, you can ignore this email.`,
    html: emailTemplate("Verify your JobHive account", "Use the code below to verify your email address.", code, "This code expires in 10 minutes."),
  };
}

export function resetEmail(code: string) {
  return {
    subject: "Reset your JobHive password",
    text: `We received a request to reset your JobHive password.\n\nYour reset code is ${code}.\n\nThis code expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: emailTemplate("Reset your JobHive password", "Use the code below to continue resetting your password.", code, "This code expires in 10 minutes. If you did not request this, you can ignore this email."),
  };
}

function emailTemplate(title: string, intro: string, code: string, note: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#17233c"><div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e4e9f2;border-radius:12px;padding:32px"><div style="font-size:24px;font-weight:700;color:#2563eb">Job<span style="color:#17233c">Hive</span></div><h1 style="font-size:22px;margin:28px 0 12px">${title}</h1><p style="font-size:15px;line-height:1.6;color:#526078">${intro}</p><div style="margin:24px 0;padding:18px;text-align:center;background:#eff6ff;border-radius:8px;letter-spacing:8px;font-size:30px;font-weight:700;color:#1d4ed8">${code}</div><p style="font-size:13px;line-height:1.6;color:#68758a">${note}</p><hr style="border:0;border-top:1px solid #e4e9f2;margin:24px 0"><p style="font-size:12px;color:#8a95a6;margin:0">This is an automated message from JobHive. Please do not reply.</p></div></body></html>`;
}
