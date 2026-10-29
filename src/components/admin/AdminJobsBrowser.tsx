"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import JobsTable from "@/components/admin/JobsTable";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { buttonClasses } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import type { CategoryWithCount, Job } from "@/types/job.types";
import type { PaginatedItems } from "@/lib/utils/pagination";

interface AdminJobsData {
  page: PaginatedItems<Job>;
  categories: CategoryWithCount[];
}

export default function AdminJobsBrowser({ initialData }: { initialData: AdminJobsData }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();
  const values = useMemo(() => ({
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    status: params.get("status") ?? "",
    sort: params.get("sort") ?? "created_at",
    direction: params.get("direction") ?? "desc",
  }), [params]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/jobs?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error ?? "Jobs are unavailable.");
        setData(result.data);
        setError(null);
      })
      .catch((reason: Error) => {
        if (reason.name !== "AbortError") setError("Jobs are temporarily unavailable. Please try again.");
      });
    return () => controller.abort();
  }, [params]);

  function updateQuery(valuesToSet: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(valuesToSet)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateQuery({
      q: String(form.get("q") ?? ""),
      category: String(form.get("category") ?? ""),
      status: String(form.get("status") ?? ""),
      sort: String(form.get("sort") ?? "created_at"),
      direction: String(form.get("direction") ?? "desc"),
    });
  }

  function goToPage(page: number) {
    const next = new URLSearchParams(params.toString());
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  function resetFilters() {
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  const page = data.page;
  return (
    <>
      <form onSubmit={submit} className="mb-5 grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-2 xl:grid-cols-5">
        <input name="q" defaultValue={values.q} placeholder="Search jobs..." className={inputClass} />
        <select name="category" defaultValue={values.category} className={inputClass}><option value="">All categories</option>{data.categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select>
        <select name="status" defaultValue={values.status} className={inputClass}><option value="">All statuses</option><option value="open">Open</option><option value="closed">Closed</option></select>
        <select name="sort" defaultValue={values.sort} className={inputClass}><option value="created_at">Posted date</option><option value="title">Alphabetical</option></select>
        <select name="direction" defaultValue={values.direction} className={inputClass}><option value="desc">{values.sort === "title" ? "Z-A" : "Newest first"}</option><option value="asc">{values.sort === "title" ? "A-Z" : "Oldest first"}</option></select>
        <div className="flex gap-3 md:col-span-2 xl:col-span-5">
          <button className={`${buttonClasses("primary")} flex-1`}>Apply filters</button>
          <button type="button" onClick={resetFilters} className={buttonClasses("outline")}>Reset filters</button>
        </div>
      </form>
      {loading ? <PageSkeleton rows={10} /> : error ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{error}</div> : (
        <>
          <JobsTable jobs={page.items} categories={data.categories} />
          {page.totalPages > 1 && <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">Showing {page.start}–{page.end} of {page.totalItems}</p>
            <div className="flex gap-1">
              <button type="button" disabled={page.currentPage === 1} onClick={() => goToPage(page.currentPage - 1)} className="rounded-md border border-line px-3 py-2 disabled:opacity-40">Previous</button>
              {Array.from({ length: page.totalPages }, (_, index) => index + 1).slice(Math.max(0, page.currentPage - 3), page.currentPage + 2).map((number) => <button key={number} type="button" onClick={() => goToPage(number)} className={`min-w-9 rounded-md border px-3 py-2 text-sm ${number === page.currentPage ? "border-primary bg-primary text-white" : "border-line hover:bg-surface"}`}>{number}</button>)}
              <button type="button" disabled={page.currentPage === page.totalPages} onClick={() => goToPage(page.currentPage + 1)} className="rounded-md border border-line px-3 py-2 disabled:opacity-40">Next</button>
            </div>
          </nav>}
        </>
      )}
    </>
  );
}
