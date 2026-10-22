import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listJobs } from "@/modules/jobs/jobs.service";
import JobCard from "@/components/jobs/JobCard";

export default function LatestJobs() {
  const jobs = listJobs({ limit: 6 });
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-navy">Latest Jobs</h2>
        <Link href="/jobs" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View All Jobs <ArrowRight size={16} />
        </Link>
      </div>
      {jobs.length === 0 ? (
        <p className="mt-6 text-muted">No jobs yet. Check back soon.</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
