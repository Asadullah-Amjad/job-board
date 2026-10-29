"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import JobCard from "@/components/jobs/JobCard";
import { inputClass } from "@/components/ui/Field";
import { buttonClasses } from "@/components/ui/Button";
import PageSkeleton from "@/components/ui/PageSkeleton";
import type { CategoryWithCount, Job } from "@/types/job.types";
import { JOB_TYPES } from "@/types/job.types";
import type { PaginatedItems } from "@/lib/utils/pagination";
import LocationSelect from "./LocationSelect";

export default function JobsBrowser({ categories }: { categories: CategoryWithCount[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [page, setPage] = useState<PaginatedItems<Job> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();
  const values = useMemo(() => ({
    q: params.get("q") ?? "",
    locationRegion: params.get("locationRegion") ?? "",
    category: params.get("category") ?? "",
    type: params.get("type") ?? "",
    page: params.get("page") ?? "1",
  }), [params]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/jobs?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error("Jobs unavailable");
        setError(null);
        setPage(result.data);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setError("Jobs are temporarily unavailable. Please try again.");
          setPage(null);
        }
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
      locationRegion: String(form.get("locationRegion") ?? ""),
      category: String(form.get("category") ?? ""),
      type: String(form.get("type") ?? ""),
    });
  }

  function goToPage(number: number) {
    const next = new URLSearchParams(params.toString());
    if (number > 1) next.set("page", String(number));
    else next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Browse Jobs</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <form onSubmit={submit} className="space-y-4 rounded-lg border border-line bg-white p-5">
          <h2 className="font-bold text-navy">Filter jobs</h2>
          <label className="block text-sm font-medium">Keyword<input name="q" defaultValue={values.q} placeholder="Job title, company" className={`${inputClass} mt-1 font-normal`} /></label>
          <label className="block text-sm font-medium">Gulf country or region<LocationSelect defaultValue={values.locationRegion} className={`${inputClass} mt-1 font-normal`} /></label>
          <label className="block text-sm font-medium">Category<select name="category" defaultValue={values.category} className={`${inputClass} mt-1 font-normal`}><option value="">All categories</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
          <label className="block text-sm font-medium">Job type<select name="type" defaultValue={values.type} className={`${inputClass} mt-1 font-normal`}><option value="">All types</option>{JOB_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <div className="flex gap-2"><button type="submit" className={buttonClasses("primary", "flex-1")}>Apply filters</button><button type="button" onClick={() => updateQuery({ q: "", locationRegion: "", category: "", type: "" })} className={buttonClasses("outline")}>Reset</button></div>
        </form>
        <div>
          {loading ? <PageSkeleton cards rows={6} /> : error ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{error}</div> : !page ? <PageSkeleton cards rows={6} /> : <><p className="mb-4 text-sm text-muted">{page.totalItems} {page.totalItems === 1 ? "job" : "jobs"} found</p>{page.totalItems === 0 ? <div className="rounded-lg border border-dashed border-line p-10 text-center text-muted">No jobs match your search. Try a different keyword or city.</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{page.items.map((job) => <JobCard key={job.id} job={job} />)}</div>}<nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">Showing {page.start}–{page.end} of {page.totalItems}</p><div className="flex gap-1">{Array.from({ length: page.totalPages }, (_, index) => index + 1).slice(Math.max(0, page.currentPage - 3), page.currentPage + 2).map((number) => <button key={number} type="button" onClick={() => goToPage(number)} className={`min-w-9 rounded-md border px-3 py-2 text-sm ${number === page.currentPage ? "border-primary bg-primary text-white" : "border-line hover:bg-surface"}`}>{number}</button>)}</div></nav></>}
        </div>
      </div>
    </div>
  );
}
