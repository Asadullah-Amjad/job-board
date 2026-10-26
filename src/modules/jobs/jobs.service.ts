import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";
import type { CategoryWithCount, Job, JobInput } from "@/types/job.types";

export interface JobFilters {
  q?: string;
  location?: string;
  category?: string;
  type?: string;
  includeClosed?: boolean;
  limit?: number;
}

function mapJob(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    company: row.company as string,
    location: row.location as string,
    type: row.type as Job["type"],
    salaryMin: row.salary_min as number,
    salaryMax: row.salary_max as number,
    categorySlug: row.category_slug as string,
    description: row.description as string,
    requirements: row.requirements as string,
    status: row.status as Job["status"],
    createdAt: row.created_at as string,
  };
}

export async function listJobs(f: JobFilters = {}): Promise<Job[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });
  if (!f.includeClosed) query = query.eq("status", "open");
  if (f.location) query = query.ilike("location", `%${f.location}%`);
  if (f.category) query = query.eq("category_slug", f.category);
  if (f.type) query = query.eq("type", f.type);
  if (f.q) query = query.or(`title.ilike.%${f.q}%,company.ilike.%${f.q}%,description.ilike.%${f.q}%`);
  if (f.limit) query = query.limit(f.limit);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapJob);
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("jobs").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapJob(data) : null;
}

export async function getJobById(id: string): Promise<Job | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapJob(data) : null;
}

export async function createJob(input: JobInput) {
  const supabase = await createSupabaseServerClient();
  const baseSlug = slugify(`${input.title}-${input.company}`);
  const row = {
    slug: baseSlug,
    title: input.title, company: input.company, location: input.location,
    type: input.type, salary_min: input.salaryMin, salary_max: input.salaryMax,
    category_slug: input.categorySlug, description: input.description,
    requirements: input.requirements, status: input.status,
  };
  const { data, error } = await supabase.from("jobs").insert(row).select("*").single();
  if (error) {
    if (error.code === "23505") {
      const retry = await supabase.from("jobs").insert({ ...row, slug: `${baseSlug}-${crypto.randomUUID().slice(0, 6)}` }).select("*").single();
      if (retry.error) throw new Error(retry.error.message);
      return mapJob(retry.data);
    }
    throw new Error(error.message);
  }
  return mapJob(data);
}

export async function updateJob(id: string, input: JobInput) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("jobs").update({
    title: input.title, company: input.company, location: input.location,
    type: input.type, salary_min: input.salaryMin, salary_max: input.salaryMax,
    category_slug: input.categorySlug, description: input.description,
    requirements: input.requirements, status: input.status,
  }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteJob(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listCategories(): Promise<CategoryWithCount[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug,name,jobs(id,status)")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    slug: row.slug,
    name: row.name,
    jobCount: row.jobs.filter((job: { status: string }) => job.status === "open").length,
  }));
}

export async function createCategory(name: string) {
  const supabase = await createSupabaseServerClient();
  const slug = slugify(name);
  if (!slug) return false;
  const { error } = await supabase.from("categories").insert({ slug, name });
  return !error;
}

export async function deleteCategory(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("category_slug", slug);
  if (count) return false;
  const { error } = await supabase.from("categories").delete().eq("slug", slug);
  return !error;
}
