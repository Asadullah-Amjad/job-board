import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("jobhive_session")?.value;
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
    : null;
  const { data: session } = supabase
    ? await supabase.from("auth_sessions").select("user_id").eq("token_hash", await hashToken(token ?? "")).gt("expires_at", new Date().toISOString()).maybeSingle()
    : { data: null };
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: req });
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
