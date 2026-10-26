import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Application, ApplicationStatus, Resume, SafeUser } from "@/types/db.types";
import type { Job } from "@/types/job.types";

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

export async function listApplications(filter: { userId?: string; status?: string } = {}): Promise<ApplicationView[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("applications").select(viewSelect).order("created_at", { ascending: false });
  if (filter.userId) query = query.eq("user_id", filter.userId);
  if (filter.status) query = query.eq("status", filter.status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return Promise.all((data ?? []).map(hydrate));
}

export async function getApplication(id: string): Promise<ApplicationView | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("applications").select(viewSelect).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? hydrate(data) : null;
}

export async function hasApplied(userId: string, jobId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("applications").select("id").eq("user_id", userId).eq("job_id", jobId).maybeSingle();
  return Boolean(data);
}

export async function createApplication(input: { userId: string; jobId: string; resumeId: string; note: string }): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: job } = await supabase.from("jobs").select("id,status").eq("id", input.jobId).maybeSingle();
  if (!job || job.status !== "open") return { error: "This job is no longer open." };
  const { data: resume } = await supabase.from("resumes").select("id").eq("id", input.resumeId).eq("user_id", input.userId).maybeSingle();
  if (!resume) return { error: "Please select one of your resumes." };
  const { error } = await supabase.from("applications").insert({ ...input, job_id: input.jobId, user_id: input.userId, resume_id: input.resumeId, status: "pending" });
  if (error?.code === "23505") return { error: "You have already applied for this job." };
  if (error) return { error: error.message };
  return {};
}

export async function setApplicationStatus(id: string, status: ApplicationStatus) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function applicationStats() {
  const supabase = await createSupabaseServerClient();
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
