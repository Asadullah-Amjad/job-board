export type JobType = "Full Time" | "Part Time" | "Contract";
export const JOB_TYPES: JobType[] = ["Full Time", "Part Time", "Contract"];
export type JobStatus = "open" | "closed";

export interface Category {
  slug: string;
  name: string;
}
export interface CategoryWithCount extends Category {
  jobCount: number;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salaryMin: number;
  salaryMax: number;
  categorySlug: string;
  description: string;
  requirements: string; // har line ek requirement
  status: JobStatus;
  createdAt: string;
}

export type JobInput = Omit<Job, "id" | "slug" | "createdAt">;

export function isNewJob(job: Pick<Job, "createdAt">) {
  return Date.now() - new Date(job.createdAt).getTime() < 7 * 86_400_000;
}
