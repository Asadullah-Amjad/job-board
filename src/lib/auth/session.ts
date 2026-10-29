import { redirect } from "next/navigation";
import { findUserById } from "@/modules/auth/auth.service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { destroyCustomSession, getCustomSessionUserId } from "./custom-session";
import type { SafeUser } from "@/types/db.types";

export async function getCurrentUser(): Promise<SafeUser | null> {
  const userId = await getCustomSessionUserId();
  return userId ? findUserById(userId) : null;
}

export async function destroySession() {
  await destroyCustomSession();
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
