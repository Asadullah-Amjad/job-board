"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/types/api.types";
import { str, safeNext } from "@/lib/utils/form";
import { destroySession, getCurrentUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "Email or password is incorrect, or email is not confirmed." };

  const user = await getCurrentUser();
  redirect(user?.role === "admin" ? "/admin" : safeNext(str(fd, "next")) || "/dashboard");
}

export async function registerAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  if (name.length < 2) return { error: "Please enter your full name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== str(fd, "confirm")) return { error: "Passwords do not match." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  if (!data.session) {
    return { success: "Check your email to confirm your account before logging in." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  });

  return { success: "If an account exists for this email, you will receive a password reset link." };
}

export async function resetPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const password = str(fd, "password");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== str(fd, "confirm")) return { error: "Passwords do not match." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  await destroySession();
  redirect("/login?reset=1");
}
