import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JobDetails from "@/components/jobs/JobDetails";
import { getCurrentUser } from "@/lib/auth/session";
import { getJobBySlug, listCategories } from "@/modules/jobs/jobs.service";
import { hasApplied } from "@/modules/applications/applications.service";
import { listResumes } from "@/modules/resumes/resumes.service";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  return { title: job ? `${job.title} at ${job.company}` : "Job not found" };
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const user = await getCurrentUser();
  const isCandidate = user?.role === "user";
  const [resumes, applied, categories] = await Promise.all([
    isCandidate ? listResumes(user.id) : Promise.resolve([]),
    isCandidate ? hasApplied(user.id, job.id) : Promise.resolve(false),
    listCategories(),
  ]);
  const resumeOptions = resumes.map((resume) => ({ id: resume.id, name: resume.originalName }));
  const categoryName = categories.find((c) => c.slug === job.categorySlug)?.name ?? "Others";

  return <JobDetails job={job} categoryName={categoryName} user={user} applied={applied} resumes={resumeOptions} />;
}
