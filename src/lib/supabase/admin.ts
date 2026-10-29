import { createClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/errors";

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new AppError("DATABASE_UNAVAILABLE", "The service is temporarily unavailable.");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
