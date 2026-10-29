import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createOpaqueToken, hashToken } from "./crypto";
import { AppError } from "@/lib/errors";

export const SESSION_COOKIE = "jobhive_session";
const SESSION_DAYS = 30;

function expiry() {
  return new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
}

export async function createCustomSession(userId: string) {
  const token = createOpaqueToken();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("auth_sessions").insert({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiry(),
  });
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Sign-in is temporarily unavailable.", 500, { cause: error });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function destroyCustomSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await createSupabaseAdminClient()
      .from("auth_sessions")
      .delete()
      .eq("token_hash", hashToken(token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCustomSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("auth_sessions")
    .select("user_id,expires_at")
    .eq("token_hash", hashToken(token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  await supabase
    .from("auth_sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("token_hash", hashToken(token));
  return data.user_id as string;
}
