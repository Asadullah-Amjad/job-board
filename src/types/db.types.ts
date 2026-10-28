import type { Category, Job } from "./job.types";

export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  city?: string;
  skills?: string;
  bio?: string;
  createdAt: string;
}
export type SafeUser = User;

export interface Resume {
  id: string;
  userId: string;
  originalName: string;
  storedName: string;
  size: number;
  mime: string;
  createdAt: string;
}

export const APPLICATION_STATUSES = [
  "pending",
  "reviewed",
  "shortlisted",
  "rejected",
  "hired",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  resumeId: string;
  note: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface Database {
  users: User[];
  categories: Category[];
  jobs: Job[];
  resumes: Resume[];
  applications: Application[];
  resetTokens: unknown[];
  messages: ContactMessage[];
}
