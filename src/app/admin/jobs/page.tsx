import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import JobsTable from "@/components/admin/JobsTable";
import { buttonClasses } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth/session";
import { listCategories, listJobsPage } from "@/modules/jobs/jobs.service";
import { parsePage } from "@/lib/utils/pagination";
import Pagination from "@/components/ui/Pagination";
import { inputClass } from "@/components/ui/Field";

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; category?: string; status?: string; sort?: string; direction?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [page, categories] = await Promise.all([
    listJobsPage({
      includeClosed: true,
      page: parsePage(params.page),
      pageSize: 10,
      q: params.q,
      category: params.category,
      status: params.status === "closed" || params.status === "open" ? params.status : undefined,
      sort: params.sort === "title" ? "title" : "created_at",
      direction: params.direction === "asc" ? "asc" : "desc",
    }),
    listCategories(),
  ]);
  const query = { q: params.q, category: params.category, status: params.status, sort: params.sort, direction: params.direction };
  return (
    <>
      <PageTitle title="Jobs" action={<Link href="/admin/jobs/new" className={buttonClasses("primary")}>Post new job</Link>} />
      <form method="GET" className="mb-5 grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-2 xl:grid-cols-5">
        <input name="q" defaultValue={params.q} placeholder="Search jobs..." className={inputClass} />
        <select name="category" defaultValue={params.category ?? ""} className={inputClass}><option value="">All categories</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select>
        <select name="status" defaultValue={params.status ?? ""} className={inputClass}><option value="">All statuses</option><option value="open">Open</option><option value="closed">Closed</option></select>
        <select name="sort" defaultValue={params.sort ?? "created_at"} className={inputClass}><option value="created_at">Posted date</option><option value="title">Alphabetical</option></select>
        <select name="direction" defaultValue={params.direction ?? "desc"} className={inputClass}><option value="desc">{params.sort === "title" ? "Z-A" : "Newest first"}</option><option value="asc">{params.sort === "title" ? "A-Z" : "Oldest first"}</option></select>
        <button className={`${buttonClasses("primary")} md:col-span-2 xl:col-span-5`}>Apply filters</button>
      </form>
      <JobsTable jobs={page.items} categories={categories} />
      <Pagination page={page} pathname="/admin/jobs" searchParams={query} />
    </>
  );
}
