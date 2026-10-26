import { redirect } from "next/navigation";
import { findUserById } from "@/modules/auth/auth.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SafeUser } from "@/types/db.types";

export async function getCurrentUser(): Promise<SafeUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return findUserById(user.id);
}

export async function destroySession() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
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
