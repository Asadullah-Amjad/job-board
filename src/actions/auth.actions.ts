"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/types/api.types";
import { str, safeNext } from "@/lib/utils/form";
import { destroySession, getCurrentUser } from "@/lib/auth/session";
import { createCustomSession } from "@/lib/auth/custom-session";
import {
  authenticateCustomUser,
  registerCustomUser,
  requestPasswordReset,
  resetCustomPassword,
  resendVerification,
  verifyEmailCode,
} from "@/modules/auth/auth.service";
import { AppError, publicMessage } from "@/lib/errors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  let result;
  try {
    result = await authenticateCustomUser(email, password);
  } catch (error) {
    return { error: publicMessage(error, "Login is temporarily unavailable. Please try again."), code: error instanceof AppError ? error.code : "INTERNAL_ERROR" };
  }
  if (result.error || !result.userId) return { error: result.error ?? "Unable to log in." };
  await createCustomSession(result.userId);
  const user = await getCurrentUser();
  const next = safeNext(str(fd, "next"));
  redirect(
    user?.role === "admin"
      ? "/admin"
      : next.startsWith("/admin") ? "/dashboard" : next || "/dashboard"
  );
}

export async function registerAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  if (name.length < 2) return { error: "Please enter your full name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== str(fd, "confirm")) return { error: "Passwords do not match." };

  let result;
  try {
    result = await registerCustomUser({ name, email, password });
  } catch (error) {
    return { error: publicMessage(error, "Registration is temporarily unavailable. Please try again."), code: error instanceof AppError ? error.code : "INTERNAL_ERROR" };
  }
  if (result.error) return { error: result.error };
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  try {
    await requestPasswordReset(email);
  } catch (error) {
    return { error: publicMessage(error, "We could not process that request. Please try again."), code: error instanceof AppError ? error.code : "INTERNAL_ERROR" };
  }
  return { success: "If an account exists for this email, you will receive a reset code." };
}

export async function resetPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const resetCode = str(fd, "code");
  const password = str(fd, "password");
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (!/^\d{6}$/.test(resetCode)) return { error: "Please enter the six-digit reset code." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== str(fd, "confirm")) return { error: "Passwords do not match." };
  try {
    if (!(await resetCustomPassword(email, resetCode, password))) return { error: "The reset code is invalid or expired.", code: "VALIDATION_ERROR" };
  } catch (error) {
    return { error: publicMessage(error, "Password reset is temporarily unavailable. Please try again."), code: error instanceof AppError ? error.code : "INTERNAL_ERROR" };
  }
  redirect("/login?reset=1");
}

export async function verifyEmailAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const code = str(fd, "code");
  if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(code)) return { error: "Enter a valid email and six-digit code." };
  if (!(await verifyEmailCode(email, code))) return { error: "The verification code is invalid or expired." };
  redirect("/login?verified=1");
}

export async function resendVerificationAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  await resendVerification(email);
  return { success: "If the account is awaiting verification, a new code has been sent." };
}
