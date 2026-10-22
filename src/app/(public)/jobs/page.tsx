import type { Metadata } from "next";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import { listCategories, listJobs } from "@/modules/jobs/jobs.service";
import Pagination from "@/components/ui/Pagination";
import { paginate, parsePage } from "@/lib/utils/pagination";

export const metadata: Metadata = { title: "Browse Jobs" };

type SP = { q?: string; location?: string; category?: string; type?: string; page?: string };

// Next 16: searchParams ek Promise hai
export default async function JobsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = paginate(listJobs(sp), parsePage(sp.page), 12);
  const categories = listCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Browse Jobs</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <JobFilters categories={categories} values={sp} />
        <div>
          <p className="mb-4 text-sm text-muted">{page.totalItems} {page.totalItems === 1 ? "job" : "jobs"} found</p>
          {page.totalItems === 0 ? (
            <div className="rounded-lg border border-dashed border-line p-10 text-center text-muted">
              No jobs match your search. Try a different keyword or city.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {page.items.map((job) => (<JobCard key={job.id} job={job} />))}
            </div>
          )}
          <Pagination page={page} pathname="/jobs" searchParams={sp} />
        </div>
      </div>
    </div>
  );
}
