import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AppError } from "@/lib/errors";
import { slugify } from "@/lib/utils/slugify";
import type { CategoryWithCount, Job, JobInput } from "@/types/job.types";
import type { PaginatedItems } from "@/lib/utils/pagination";

export interface JobFilters {
  q?: string;
  location?: string;
  category?: string;
  type?: string;
  includeClosed?: boolean;
  limit?: number;
}

export interface JobPageFilters extends JobFilters {
  page?: number;
  pageSize?: number;
  sort?: "title" | "created_at";
  direction?: "asc" | "desc";
  status?: "open" | "closed";
}

export interface CategoryPageFilters {
  page?: number;
  pageSize?: number;
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
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Jobs are temporarily unavailable. Please try again.", 500, { cause: error });
  return (data ?? []).map(mapJob);
}

export async function listJobsPage(f: JobPageFilters = {}): Promise<PaginatedItems<Job>> {
  const supabase = await createSupabaseServerClient();
  const pageSize = f.pageSize ?? 12;
  const requestedPage = f.page ?? 1;
  const start = (Math.max(1, requestedPage) - 1) * pageSize;
  const end = start + pageSize - 1;
  let query = supabase.from("jobs").select("*", { count: "exact" });
  if (!f.includeClosed) query = query.eq("status", "open");
  if (f.status) query = query.eq("status", f.status);
  if (f.location) query = query.ilike("location", `%${f.location}%`);
  if (f.category) query = query.eq("category_slug", f.category);
  if (f.type) query = query.eq("type", f.type);
  if (f.q) query = query.or(`title.ilike.%${f.q}%,company.ilike.%${f.q}%,description.ilike.%${f.q}%`);
  query = query.order(f.sort ?? "created_at", { ascending: f.direction === "asc" }).range(start, end);
  let { data, error, count } = await query;
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Jobs are temporarily unavailable. Please try again.", 500, { cause: error });
  const totalItems = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  if (currentPage !== requestedPage && totalItems > 0) {
    const correctedStart = (currentPage - 1) * pageSize;
    const correctedQuery = supabase.from("jobs").select("*", { count: "exact" });
    if (!f.includeClosed) correctedQuery.eq("status", "open");
    if (f.status) correctedQuery.eq("status", f.status);
    if (f.location) correctedQuery.ilike("location", `%${f.location}%`);
    if (f.category) correctedQuery.eq("category_slug", f.category);
    if (f.type) correctedQuery.eq("type", f.type);
    if (f.q) correctedQuery.or(`title.ilike.%${f.q}%,company.ilike.%${f.q}%,description.ilike.%${f.q}%`);
    const corrected = await correctedQuery.order(f.sort ?? "created_at", { ascending: f.direction === "asc" }).range(correctedStart, correctedStart + pageSize - 1);
    data = corrected.data;
    error = corrected.error;
  }
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Jobs are temporarily unavailable. Please try again.", 500, { cause: error });
  const currentStart = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const items = (data ?? []).map(mapJob);
  return { items, currentPage, totalItems, totalPages, start: currentStart, end: currentStart ? currentStart + items.length - 1 : 0 };
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("jobs").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Jobs are temporarily unavailable. Please try again.", 500, { cause: error });
  return data ? mapJob(data) : null;
}

export async function getJobById(id: string): Promise<Job | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Jobs are temporarily unavailable. Please try again.", 500, { cause: error });
  return data ? mapJob(data) : null;
}

export async function createJob(input: JobInput) {
  const supabase = createSupabaseAdminClient();
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
      if (retry.error) throw new AppError("DATABASE_UNAVAILABLE", "The job could not be created. Please try again.", 500, { cause: retry.error });
      return mapJob(retry.data);
    }
    throw new AppError("DATABASE_UNAVAILABLE", "The job could not be created. Please try again.", 500, { cause: error });
  }
  return mapJob(data);
}

export async function updateJob(id: string, input: JobInput) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("jobs").update({
    title: input.title, company: input.company, location: input.location,
    type: input.type, salary_min: input.salaryMin, salary_max: input.salaryMax,
    category_slug: input.categorySlug, description: input.description,
    requirements: input.requirements, status: input.status,
  }).eq("id", id);
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "The job could not be updated. Please try again.", 500, { cause: error });
}

export async function deleteJob(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "The job could not be deleted. Please try again.", 500, { cause: error });
}

export async function listCategories(): Promise<CategoryWithCount[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug,name,jobs(id,status)")
    .order("name");
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Categories are temporarily unavailable. Please try again.", 500, { cause: error });
  return (data ?? []).map((row) => ({
    slug: row.slug,
    name: row.name,
    jobCount: row.jobs.filter((job: { status: string }) => job.status === "open").length,
  }));
}

export async function listCategoriesPage(f: CategoryPageFilters = {}): Promise<PaginatedItems<CategoryWithCount>> {
  const supabase = await createSupabaseServerClient();
  const pageSize = f.pageSize ?? 10;
  const requestedPage = f.page ?? 1;
  const startIndex = (Math.max(1, requestedPage) - 1) * pageSize;
  const { data, error, count } = await supabase
    .from("categories")
    .select("slug,name,jobs(id,status)", { count: "exact" })
    .order("name")
    .range(startIndex, startIndex + pageSize - 1);
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Categories are temporarily unavailable. Please try again.", 500, { cause: error });
  const totalItems = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const items = (data ?? []).map((row) => ({
    slug: row.slug,
    name: row.name,
    jobCount: row.jobs.filter((job: { status: string }) => job.status === "open").length,
  }));
  if (currentPage !== requestedPage && totalItems > 0) {
    const correctedStart = (currentPage - 1) * pageSize;
    const corrected = await supabase
      .from("categories")
      .select("slug,name,jobs(id,status)", { count: "exact" })
      .order("name")
      .range(correctedStart, correctedStart + pageSize - 1);
    if (corrected.error) throw new AppError("DATABASE_UNAVAILABLE", "Categories are temporarily unavailable. Please try again.", 500, { cause: corrected.error });
    items.splice(0, items.length, ...(corrected.data ?? []).map((row) => ({
      slug: row.slug,
      name: row.name,
      jobCount: row.jobs.filter((job: { status: string }) => job.status === "open").length,
    })));
  }
  return {
    items,
    currentPage,
    totalItems,
    totalPages,
    start: totalItems ? (currentPage - 1) * pageSize + 1 : 0,
    end: totalItems ? (currentPage - 1) * pageSize + items.length : 0,
  };
}

export async function createCategory(name: string) {
  const supabase = createSupabaseAdminClient();
  const slug = slugify(name);
  if (!slug) return false;
  const { error } = await supabase.from("categories").insert({ slug, name });
  return !error;
}

export async function updateCategory(slug: string, name: string) {
  const supabase = createSupabaseAdminClient();
  const trimmedName = name.trim();
  if (trimmedName.length < 2) return { ok: false as const, reason: "short" as const };
  const { error } = await supabase.from("categories").update({ name: trimmedName }).eq("slug", slug);
  if (error?.code === "23505") return { ok: false as const, reason: "duplicate" as const };
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "The category could not be updated. Please try again.", 500, { cause: error });
  return { ok: true as const };
}

export async function deleteCategory(slug: string) {
  const supabase = createSupabaseAdminClient();
  const { count } = await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("category_slug", slug);
  if (count) return false;
  const { error } = await supabase.from("categories").delete().eq("slug", slug);
  return !error;
}
