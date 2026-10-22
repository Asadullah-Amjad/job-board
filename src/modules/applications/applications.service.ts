import { readDb, updateDb, uid } from "@/lib/db";
import { toSafe } from "@/modules/auth/auth.service";
import type { Application, ApplicationStatus, Database, Resume, SafeUser } from "@/types/db.types";
import type { Job } from "@/types/job.types";

export interface ApplicationView extends Application {
  job: Job | null;
  candidate: SafeUser | null;
  resume: Resume | null;
}

function view(db: Database, a: Application): ApplicationView {
  const user = db.users.find((u) => u.id === a.userId);
  return {
    ...a,
    job: db.jobs.find((j) => j.id === a.jobId) ?? null,
    candidate: user ? toSafe(user) : null,
    resume: db.resumes.find((r) => r.id === a.resumeId) ?? null,
  };
}

export function listApplications(filter: { userId?: string; status?: string } = {}) {
  const db = readDb();
  return db.applications
    .filter((a) => (!filter.userId || a.userId === filter.userId) && (!filter.status || a.status === filter.status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((a) => view(db, a));
}

export function getApplication(id: string) {
  const db = readDb();
  const a = db.applications.find((x) => x.id === id);
  return a ? view(db, a) : null;
}

export function hasApplied(userId: string, jobId: string) {
  return readDb().applications.some((a) => a.userId === userId && a.jobId === jobId);
}

export function createApplication(input: { userId: string; jobId: string; resumeId: string; note: string }): { error?: string } {
  return updateDb((db) => {
    const job = db.jobs.find((j) => j.id === input.jobId);
    if (!job || job.status !== "open") return { error: "This job is no longer open." };
    const resume = db.resumes.find((r) => r.id === input.resumeId && r.userId === input.userId);
    if (!resume) return { error: "Please select one of your resumes." };
    if (db.applications.some((a) => a.userId === input.userId && a.jobId === input.jobId))
      return { error: "You have already applied for this job." };
    const now = new Date().toISOString();
    db.applications.push({ id: uid(), ...input, status: "pending", createdAt: now, updatedAt: now });
    return {};
  });
}

export function setApplicationStatus(id: string, status: ApplicationStatus) {
  updateDb((db) => {
    const a = db.applications.find((x) => x.id === id);
    if (a) {
      a.status = status;
      a.updatedAt = new Date().toISOString();
    }
  });
}

export function applicationStats() {
  const db = readDb();
  return {
    total: db.applications.length,
    pending: db.applications.filter((a) => a.status === "pending").length,
    jobs: db.jobs.length,
    openJobs: db.jobs.filter((j) => j.status === "open").length,
    candidates: db.users.filter((u) => u.role === "candidate").length,
  };
}
