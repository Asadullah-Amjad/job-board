import { randomInt } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createOpaqueToken, hashPassword, hashToken, verifyPassword } from "@/lib/auth/crypto";
import { sendEmail, resetEmail, verificationEmail } from "@/lib/email/mailer";
import { AppError, isMissingSchemaError } from "@/lib/errors";
import type { User } from "@/types/db.types";

export async function findUserById(id: string): Promise<User | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,name,email,role,phone,city,skills,bio,created_at")
    .eq("id", id)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    phone: data.phone ?? undefined,
    city: data.city ?? undefined,
    skills: data.skills ?? undefined,
    bio: data.bio ?? undefined,
    createdAt: data.created_at,
  };
}

const CODE_TTL_MINUTES = 10;

async function consumeRateLimit(key: string, limit: number, windowSeconds: number) {
  const { data, error } = await createSupabaseAdminClient().rpc("consume_auth_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new AppError("RATE_LIMITED", "Too many requests. Please try again later.", 429, { cause: error });
  return data === true;
}

function code() {
  return String(randomInt(100000, 1000000));
}

function expiry() {
  return new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString();
}

export async function registerCustomUser(input: { name: string; email: string; password: string }) {
  const supabase = createSupabaseAdminClient();
  const normalizedEmail = input.email.toLowerCase();
  const { data: existing, error: lookupError } = await supabase.from("users").select("id").eq("email", normalizedEmail).maybeSingle();
  if (lookupError) {
    throw new AppError(
      isMissingSchemaError(lookupError) ? "DATABASE_UNAVAILABLE" : "INTERNAL_ERROR",
      "Registration is temporarily unavailable. Please try again.",
      500,
      { cause: lookupError }
    );
  }
  if (existing) return { error: "An account with this email already exists. Please log in." };

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(input.password);
  const { error: userError } = await supabase.from("users").insert({
    id,
    email: normalizedEmail,
    password_hash: passwordHash,
  });
  if (userError) {
    if (userError.code === "23505") return { error: "An account with this email already exists. Please log in.", code: "CONFLICT" };
    throw new AppError(
      isMissingSchemaError(userError) ? "DATABASE_UNAVAILABLE" : "INTERNAL_ERROR",
      "Registration is temporarily unavailable. Please try again.",
      500,
      { cause: userError }
    );
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id,
    name: input.name,
    email: normalizedEmail,
    role: "user",
  });
  if (profileError) {
    await supabase.from("users").delete().eq("id", id);
    throw new AppError("DATABASE_UNAVAILABLE", "Registration is temporarily unavailable. Please try again.", 500, { cause: profileError });
  }
  await issueVerificationCode(id, normalizedEmail);
  return {};
}

export async function authenticateCustomUser(email: string, password: string) {
  if (!(await consumeRateLimit(`login:${email.toLowerCase()}`, 10, 900))) {
    return { error: "Too many login attempts. Please try again later." };
  }
  const supabase = createSupabaseAdminClient();
  const { data: user } = await supabase
    .from("users")
    .select("id,password_hash,email_verified_at")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { error: "Email or password is incorrect." };
  }
  if (!user.email_verified_at) return { error: "Please verify your email before logging in." };
  return { userId: user.id };
}

async function issueVerificationCode(userId: string, email: string) {
  const supabase = createSupabaseAdminClient();
  const { data: recent } = await supabase.from("email_verification_tokens")
    .select("id").eq("user_id", userId)
    .gt("created_at", new Date(Date.now() - 60_000).toISOString())
    .maybeSingle();
  if (recent) return;
  const rawCode = code();
  await supabase.from("email_verification_tokens").delete().eq("user_id", userId).is("consumed_at", null);
  const { error } = await supabase.from("email_verification_tokens").insert({
    user_id: userId,
    token_hash: hashToken(rawCode),
    expires_at: expiry(),
  });
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Verification email could not be prepared. Please try again.", 500, { cause: error });
  await sendEmail({ to: email, ...verificationEmail(rawCode) });
}

export async function resendVerification(email: string) {
  if (!(await consumeRateLimit(`verify-resend:${email.toLowerCase()}`, 5, 900))) return;
  const supabase = createSupabaseAdminClient();
  const { data: user } = await supabase.from("users").select("id,email,email_verified_at").eq("email", email.toLowerCase()).maybeSingle();
  if (user && !user.email_verified_at) await issueVerificationCode(user.id, user.email);
}

export async function verifyEmailCode(email: string, rawCode: string) {
  if (!(await consumeRateLimit(`verify:${email.toLowerCase()}`, 10, 900))) return false;
  const supabase = createSupabaseAdminClient();
  const { data: user } = await supabase.from("users").select("id").eq("email", email.toLowerCase()).maybeSingle();
  if (!user) return false;
  const { data: token } = await supabase.from("email_verification_tokens")
    .select("id,token_hash,attempts").eq("user_id", user.id)
    .is("consumed_at", null).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (!token) return false;
  if (token.attempts >= 5) return false;
  if (token.token_hash !== hashToken(rawCode)) {
    await supabase.from("email_verification_tokens").update({ attempts: token.attempts + 1 }).eq("id", token.id);
    return false;
  }
  await supabase.from("users").update({ email_verified_at: new Date().toISOString() }).eq("id", user.id);
  await supabase.from("email_verification_tokens").update({ consumed_at: new Date().toISOString() }).eq("id", token.id);
  return true;
}

export async function requestPasswordReset(email: string) {
  if (!(await consumeRateLimit(`reset-request:${email.toLowerCase()}`, 5, 900))) return;
  const supabase = createSupabaseAdminClient();
  const { data: user } = await supabase.from("users").select("id,email").eq("email", email.toLowerCase()).maybeSingle();
  if (user) {
    const rawCode = code();
    await supabase.from("password_reset_tokens").delete().eq("user_id", user.id).is("consumed_at", null);
    const { error } = await supabase.from("password_reset_tokens").insert({
      user_id: user.id, token_hash: hashToken(rawCode), expires_at: expiry(),
    });
    if (error) throw new AppError("DATABASE_UNAVAILABLE", "Password reset is temporarily unavailable. Please try again.", 500, { cause: error });
    await sendEmail({ to: user.email, ...resetEmail(rawCode) });
  }
}

export async function resetCustomPassword(email: string, rawCode: string, password: string) {
  if (!(await consumeRateLimit(`reset:${email.toLowerCase()}`, 10, 900))) return false;
  const supabase = createSupabaseAdminClient();
  const { data: user } = await supabase.from("users").select("id").eq("email", email.toLowerCase()).maybeSingle();
  if (!user) return false;
  const { data: token } = await supabase.from("password_reset_tokens")
    .select("id,token_hash,attempts").eq("user_id", user.id)
    .is("consumed_at", null).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (!token) return false;
  if (token.attempts >= 5) return false;
  if (token.token_hash !== hashToken(rawCode)) {
    await supabase.from("password_reset_tokens").update({ attempts: token.attempts + 1 }).eq("id", token.id);
    return false;
  }
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  await supabase.from("users").update({ password_hash: passwordHash }).eq("id", user.id);
  await supabase.from("password_reset_tokens").update({ consumed_at: now }).eq("id", token.id);
  await supabase.from("auth_sessions").delete().eq("user_id", user.id);
  return true;
}

export async function updateProfile(
  id: string,
  data: { name: string; phone: string; city: string; skills: string; bio: string }
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("profiles").update(data).eq("id", id);
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Your profile could not be saved. Please try again.", 500, { cause: error });
}

export async function addContactMessage(message: { name: string; email: string; jobTitle: string; message: string }) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: message.name,
    email: message.email,
    job_title: message.jobTitle,
    message: message.message,
  });
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Your message could not be sent. Please try again.", 500, { cause: error });
}

export async function listContactMessagesPage(filter: { q?: string; page?: number; pageSize?: number } = {}) {
  const supabase = createSupabaseAdminClient();
  const pageSize = filter.pageSize ?? 10;
  const requestedPage = Math.max(1, filter.page ?? 1);
  const start = (requestedPage - 1) * pageSize;
  let query = supabase.from("contact_messages").select("id,name,email,job_title,message,created_at", { count: "exact" }).order("created_at", { ascending: false });
  if (filter.q) query = query.or(`name.ilike.%${filter.q}%,email.ilike.%${filter.q}%,job_title.ilike.%${filter.q}%,message.ilike.%${filter.q}%`);
  const { data, error, count } = await query.range(start, start + pageSize - 1);
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Queries are temporarily unavailable. Please try again.", 500, { cause: error });
  const totalItems = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const items = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    jobTitle: row.job_title,
    message: row.message,
    createdAt: row.created_at,
  }));
  return {
    items,
    currentPage,
    totalItems,
    totalPages,
    start: totalItems ? (currentPage - 1) * pageSize + 1 : 0,
    end: totalItems ? (currentPage - 1) * pageSize + items.length : 0,
  };
}
