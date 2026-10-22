import { readDb, updateDb, uid } from "@/lib/db";
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

export function listJobs(f: JobFilters = {}): Job[] {
  const q = f.q?.toLowerCase().trim();
  const loc = f.location?.toLowerCase().trim();
  const result = readDb()
    .jobs.filter((j) => {
      if (!f.includeClosed && j.status !== "open") return false;
      if (q && !`${j.title} ${j.company} ${j.description}`.toLowerCase().includes(q)) return false;
      if (loc && !j.location.toLowerCase().includes(loc)) return false;
      if (f.category && j.categorySlug !== f.category) return false;
      if (f.type && j.type !== f.type) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return f.limit ? result.slice(0, f.limit) : result;
}

export const getJobBySlug = (slug: string) => readDb().jobs.find((j) => j.slug === slug) ?? null;
export const getJobById = (id: string) => readDb().jobs.find((j) => j.id === id) ?? null;

export function createJob(input: JobInput) {
  return updateDb((db) => {
    let slug = slugify(`${input.title}-${input.company}`);
    if (db.jobs.some((j) => j.slug === slug)) slug = `${slug}-${uid().slice(0, 6)}`;
    const job: Job = { ...input, id: uid(), slug, createdAt: new Date().toISOString() };
    db.jobs.push(job);
    return job;
  });
}

export function updateJob(id: string, input: JobInput) {
  updateDb((db) => {
    const job = db.jobs.find((j) => j.id === id);
    if (job) Object.assign(job, input);
  });
}

export function deleteJob(id: string) {
  updateDb((db) => {
    db.jobs = db.jobs.filter((j) => j.id !== id);
    db.applications = db.applications.filter((a) => a.jobId !== id);
  });
}

export function listCategories(): CategoryWithCount[] {
  const db = readDb();
  return db.categories.map((c) => ({
    ...c,
    jobCount: db.jobs.filter((j) => j.categorySlug === c.slug && j.status === "open").length,
  }));
}

export function createCategory(name: string) {
  return updateDb((db) => {
    const slug = slugify(name);
    if (!slug || db.categories.some((c) => c.slug === slug)) return false;
    db.categories.push({ slug, name });
    return true;
  });
}

export function deleteCategory(slug: string) {
  return updateDb((db) => {
    if (db.jobs.some((j) => j.categorySlug === slug)) return false;
    db.categories = db.categories.filter((c) => c.slug !== slug);
    return true;
  });
}
