import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AppError } from "@/lib/errors";
import type { Application, ApplicationStatus, Resume, SafeUser } from "@/types/db.types";
import type { Job } from "@/types/job.types";
import type { PaginatedItems } from "@/lib/utils/pagination";

export interface ApplicationView extends Application {
  job: Job | null;
  candidate: SafeUser | null;
  resume: Resume | null;
}

async function hydrate(row: Record<string, any>): Promise<ApplicationView> {
  return {
    id: row.id,
    jobId: row.job_id,
    userId: row.user_id,
    resumeId: row.resume_id,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    job: row.jobs ? {
      id: row.jobs.id,
      slug: row.jobs.slug,
      title: row.jobs.title,
      company: row.jobs.company,
      location: row.jobs.location,
      type: row.jobs.type,
      salaryMin: row.jobs.salary_min,
      salaryMax: row.jobs.salary_max,
      categorySlug: row.jobs.category_slug,
      description: row.jobs.description,
      requirements: row.jobs.requirements,
      status: row.jobs.status,
      createdAt: row.jobs.created_at,
    } : null,
    candidate: row.profiles ? {
      id: row.profiles.id,
      name: row.profiles.name,
      email: row.profiles.email,
      role: row.profiles.role,
      createdAt: row.profiles.created_at,
    } : null,
    resume: row.resumes ? {
      id: row.resumes.id,
      userId: row.resumes.user_id,
      originalName: row.resumes.original_name,
      storedName: row.resumes.stored_name,
      size: row.resumes.size_bytes,
      mime: row.resumes.mime_type,
      createdAt: row.resumes.created_at,
    } : null,
  };
}

const viewSelect = "*,jobs(*),profiles(id,name,email,role,created_at),resumes(*)";

export interface ApplicationFilters {
  userId?: string;
  status?: string;
  category?: string;
  q?: string;
}

async function matchingApplicationIds(query: string) {
  const supabase = createSupabaseAdminClient();
  const [jobs, profiles] = await Promise.all([
    supabase.from("jobs").select("id").or(`title.ilike.%${query}%,company.ilike.%${query}%`),
    supabase.from("profiles").select("id").or(`name.ilike.%${query}%,email.ilike.%${query}%`),
  ]);
  if (jobs.error) throw new AppError("DATABASE_UNAVAILABLE", "Applications are temporarily unavailable. Please try again.", 500, { cause: jobs.error });
  if (profiles.error) throw new AppError("DATABASE_UNAVAILABLE", "Applications are temporarily unavailable. Please try again.", 500, { cause: profiles.error });
  return { jobIds: (jobs.data ?? []).map((row) => row.id), userIds: (profiles.data ?? []).map((row) => row.id) };
}

async function matchingApplicationFilters(filter: ApplicationFilters) {
  const supabase = createSupabaseAdminClient();
  const [jobs, profiles] = await Promise.all([
    filter.category
      ? supabase.from("jobs").select("id").eq("category_slug", filter.category)
      : Promise.resolve({ data: [], error: null }),
    filter.q ? matchingApplicationIds(filter.q) : Promise.resolve({ jobIds: [], userIds: [] }),
  ]);
  if (jobs.error) throw new AppError("DATABASE_UNAVAILABLE", "Applications are temporarily unavailable. Please try again.", 500, { cause: jobs.error });
  return {
    categoryJobIds: (jobs.data ?? []).map((row: { id: string }) => row.id),
    searchJobIds: profiles.jobIds,
    searchUserIds: profiles.userIds,
  };
}

function applyApplicationFilters(
  query: any,
  filter: ApplicationFilters,
  matches: { categoryJobIds: string[]; searchJobIds: string[]; searchUserIds: string[] },
) {
  if (filter.userId) query = query.eq("user_id", filter.userId);
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.category) {
    if (!matches.categoryJobIds.length) return query.eq("id", "00000000-0000-0000-0000-000000000000");
    query = query.in("job_id", matches.categoryJobIds);
  }
  if (filter.q) {
    if (!matches.searchJobIds.length && !matches.searchUserIds.length) return query.eq("id", "00000000-0000-0000-0000-000000000000");
    const filters = [];
    if (matches.searchJobIds.length) filters.push(`job_id.in.(${matches.searchJobIds.join(",")})`);
    if (matches.searchUserIds.length) filters.push(`user_id.in.(${matches.searchUserIds.join(",")})`);
    query = query.or(filters.join(","));
  }
  return query;
}

export async function listApplications(filter: ApplicationFilters = {}): Promise<ApplicationView[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("applications").select(viewSelect).order("created_at", { ascending: false });
  const matches = await matchingApplicationFilters(filter);
  query = applyApplicationFilters(query, filter, matches);
  const { data, error } = await query;
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Applications are temporarily unavailable. Please try again.", 500, { cause: error });
  return Promise.all((data ?? []).map(hydrate));
}

export async function listApplicationsPage(filter: ApplicationFilters & { page?: number; pageSize?: number } = {}): Promise<PaginatedItems<ApplicationView>> {
  const supabase = createSupabaseAdminClient();
  const pageSize = filter.pageSize ?? 10;
  const requestedPage = filter.page ?? 1;
  const start = (Math.max(1, requestedPage) - 1) * pageSize;
  const end = start + pageSize - 1;
  let query = supabase.from("applications").select(viewSelect, { count: "exact" }).order("created_at", { ascending: false });
  const matches = await matchingApplicationFilters(filter);
  query = applyApplicationFilters(query, filter, matches);
  const { data, error, count } = await query.range(start, end);
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Applications are temporarily unavailable. Please try again.", 500, { cause: error });
  const totalItems = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const rows = await Promise.all((data ?? []).map(hydrate));
  return {
    items: rows,
    currentPage,
    totalItems,
    totalPages,
    start: totalItems ? (currentPage - 1) * pageSize + 1 : 0,
    end: totalItems ? (currentPage - 1) * pageSize + rows.length : 0,
  };
}

export async function getApplication(id: string): Promise<ApplicationView | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("applications").select(viewSelect).eq("id", id).maybeSingle();
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Applications are temporarily unavailable. Please try again.", 500, { cause: error });
  return data ? hydrate(data) : null;
}

export async function hasApplied(userId: string, jobId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("applications").select("id").eq("user_id", userId).eq("job_id", jobId).maybeSingle();
  return Boolean(data);
}

export async function createApplication(input: { userId: string; jobId: string; resumeId: string; note: string }): Promise<{ error?: string; code?: string }> {
  const supabase = createSupabaseAdminClient();
  const { data: job } = await supabase.from("jobs").select("id,status").eq("id", input.jobId).maybeSingle();
  if (!job || job.status !== "open") return { error: "This job is no longer open." };
  const { data: resume } = await supabase.from("resumes").select("id").eq("id", input.resumeId).eq("user_id", input.userId).maybeSingle();
  if (!resume) return { error: "Please select one of your resumes." };
  const { error } = await supabase.from("applications").insert({
    job_id: input.jobId,
    user_id: input.userId,
    resume_id: input.resumeId,
    note: input.note,
    status: "pending",
  });
  if (error?.code === "23505") return { error: "You have already applied for this job." };
  if (error) return { error: "Your application could not be submitted. Please try again.", code: "DATABASE_UNAVAILABLE" };
  return {};
}

export async function setApplicationStatus(id: string, status: ApplicationStatus) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "The application status could not be updated. Please try again.", 500, { cause: error });
}

export async function applicationStats() {
  const supabase = createSupabaseAdminClient();
  const [applications, jobs, profiles] = await Promise.all([
    supabase.from("applications").select("id,status"),
    supabase.from("jobs").select("id,status"),
    supabase.from("profiles").select("id", { count: "exact" }).eq("role", "user"),
  ]);
  const rows = applications.data ?? [];
  const jobsRows = jobs.data ?? [];
  return {
    total: rows.length,
    pending: rows.filter((row) => row.status === "pending").length,
    jobs: jobsRows.length,
    openJobs: jobsRows.filter((row) => row.status === "open").length,
    candidates: profiles.count ?? 0,
  };
}
