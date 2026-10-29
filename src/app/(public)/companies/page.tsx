import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { listCompanies } from "@/modules/companies/companies.service";
import Pagination from "@/components/ui/Pagination";
import { paginate, parsePage } from "@/lib/utils/pagination";

export const metadata: Metadata = { title: "Companies" };

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const companies = await listCompanies();
  const page = paginate(companies.sort((a, b) => b.jobCount - a.jobCount), parsePage(pageParam), 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Companies hiring now</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {page.items.map((company) => (
          <Link key={company.id} href={`/jobs?q=${encodeURIComponent(company.name)}`} className="flex items-center gap-4 rounded-lg border border-line bg-white p-5 transition hover:border-primary hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary"><Building2 size={22} /></span>
            <span>
              <span className="block font-semibold">{company.name}</span>
              <span className="text-sm text-muted">{company.jobCount} {company.jobCount === 1 ? "job" : "jobs"}</span>
            </span>
          </Link>
        ))}
        {page.totalItems === 0 && <p className="text-muted">No companies are hiring right now.</p>}
      </div>
      <Pagination page={page} pathname="/companies" searchParams={{}} />
    </div>
  );
}
