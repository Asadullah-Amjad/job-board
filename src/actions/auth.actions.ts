"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/types/api.types";
import { str, safeNext } from "@/lib/utils/form";
import { createSession, destroySession } from "@/lib/auth/session";
import { createResetToken, registerUser, resetPassword, verifyLogin } from "@/modules/auth/auth.service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const user = verifyLogin(email, password);
  if (!user) return { error: "Email or password is incorrect." };
  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : safeNext(str(fd, "next")) || "/dashboard");
}

export async function registerAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  if (name.length < 2) return { error: "Please enter your full name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== str(fd, "confirm")) return { error: "Passwords do not match." };
  const res = registerUser({ name, email, password });
  if ("error" in res) return { error: res.error };
  await createSession(res.user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  const token = createResetToken(email);
  // Email service abhi connected nahi hai, is liye link yahin dikha rahe hain.
  // Production mein token ko email karein aur link yahan se hata dein.
  return token
    ? {
        success: "Email service is not set up yet, so your reset link is shown here:",
        link: `/reset-password?token=${token}`,
      }
    : { success: "If this email is registered, a reset link has been created." };
}

export async function resetPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const password = str(fd, "password");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== str(fd, "confirm")) return { error: "Passwords do not match." };
  if (!resetPassword(str(fd, "token"), password))
    return { error: "This reset link is invalid or has expired." };
  redirect("/login?reset=1");
}
