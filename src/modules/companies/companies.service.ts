import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AppError } from "@/lib/errors";
import type { CompanyWithCount } from "@/types/company.types";

function mapCompany(row: Record<string, unknown>, jobCount = 0): CompanyWithCount {
  return { id: row.id as string, name: row.name as string, createdAt: row.created_at as string, jobCount };
}

export async function listCompanies(): Promise<CompanyWithCount[]> {
  const supabase = createSupabaseAdminClient();
  const [{ data, error }, { data: jobs, error: jobsError }] = await Promise.all([
    supabase.from("companies").select("id,name,created_at").order("name"),
    supabase.from("jobs").select("company"),
  ]);
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Companies are temporarily unavailable. Please try again.", 500, { cause: error });
  if (jobsError) throw new AppError("DATABASE_UNAVAILABLE", "Companies are temporarily unavailable. Please try again.", 500, { cause: jobsError });
  const counts = new Map<string, number>();
  for (const job of jobs ?? []) counts.set(job.company, (counts.get(job.company) ?? 0) + 1);
  return (data ?? []).map((row) => mapCompany(row, counts.get(row.name) ?? 0));
}

export async function createCompany(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false as const, reason: "short" as const };
  const { error } = await createSupabaseAdminClient().from("companies").insert({ name: trimmed });
  if (error?.code === "23505") return { ok: false as const, reason: "duplicate" as const };
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "The company could not be added. Please try again.", 500, { cause: error });
  return { ok: true as const };
}

export async function updateCompany(id: string, name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false as const, reason: "short" as const };
  const supabase = createSupabaseAdminClient();
  const { data: current, error: findError } = await supabase.from("companies").select("name").eq("id", id).maybeSingle();
  if (findError) throw new AppError("DATABASE_UNAVAILABLE", "The company could not be updated. Please try again.", 500, { cause: findError });
  if (!current) return { ok: false as const, reason: "missing" as const };
  const { error } = await supabase.from("companies").update({ name: trimmed }).eq("id", id);
  if (error?.code === "23505") return { ok: false as const, reason: "duplicate" as const };
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "The company could not be updated. Please try again.", 500, { cause: error });
  const { error: jobsError } = await supabase.from("jobs").update({ company: trimmed }).eq("company", current.name);
  if (jobsError) throw new AppError("DATABASE_UNAVAILABLE", "The company was updated, but its jobs could not be synchronized. Please try again.", 500, { cause: jobsError });
  return { ok: true as const };
}

export async function deleteCompany(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data: company, error: findError } = await supabase.from("companies").select("name").eq("id", id).maybeSingle();
  if (findError) throw new AppError("DATABASE_UNAVAILABLE", "The company could not be deleted. Please try again.", 500, { cause: findError });
  if (!company) return { ok: false as const, reason: "missing" as const };
  const { count, error: countError } = await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("company", company.name);
  if (countError) throw new AppError("DATABASE_UNAVAILABLE", "The company could not be deleted. Please try again.", 500, { cause: countError });
  if (count) return { ok: false as const, reason: "has-jobs" as const };
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "The company could not be deleted. Please try again.", 500, { cause: error });
  return { ok: true as const };
}
