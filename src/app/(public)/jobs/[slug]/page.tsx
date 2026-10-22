import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JobDetails from "@/components/jobs/JobDetails";
import { getCurrentUser } from "@/lib/auth/session";
import { getJobBySlug, listCategories } from "@/modules/jobs/jobs.service";
import { hasApplied } from "@/modules/applications/applications.service";
import { listResumes } from "@/modules/resumes/resumes.service";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  return { title: job ? `${job.title} at ${job.company}` : "Job not found" };
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) notFound();

  const user = await getCurrentUser();
  const isCandidate = user?.role === "candidate";
  const resumes = isCandidate ? listResumes(user.id).map((r) => ({ id: r.id, name: r.originalName })) : [];
  const applied = isCandidate ? hasApplied(user.id, job.id) : false;
  const categoryName = listCategories().find((c) => c.slug === job.categorySlug)?.name ?? "Others";

  return <JobDetails job={job} categoryName={categoryName} user={user} applied={applied} resumes={resumes} />;
}
