import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { listJobs } from "@/modules/jobs/jobs.service";
import Pagination from "@/components/ui/Pagination";
import { paginate, parsePage } from "@/lib/utils/pagination";

export const metadata: Metadata = { title: "Companies" };

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const counts = new Map<string, number>();
  for (const j of await listJobs()) counts.set(j.company, (counts.get(j.company) ?? 0) + 1);
  const page = paginate([...counts.entries()].sort((a, b) => b[1] - a[1]), parsePage(pageParam), 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Companies hiring now</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {page.items.map(([name, n]) => (
          <Link key={name} href={`/jobs?q=${encodeURIComponent(name)}`} className="flex items-center gap-4 rounded-lg border border-line bg-white p-5 transition hover:border-primary hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary"><Building2 size={22} /></span>
            <span>
              <span className="block font-semibold">{name}</span>
              <span className="text-sm text-muted">{n} open {n === 1 ? "job" : "jobs"}</span>
            </span>
          </Link>
        ))}
        {page.totalItems === 0 && <p className="text-muted">No companies are hiring right now.</p>}
      </div>
      <Pagination page={page} pathname="/companies" searchParams={{}} />
    </div>
  );
}
