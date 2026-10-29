"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ApplicantsTable from "@/components/admin/ApplicantsTable";
import PageSkeleton from "@/components/ui/PageSkeleton";
import Pagination from "@/components/ui/Pagination";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/utils/cn";
import { APPLICATION_STATUSES } from "@/types/db.types";
import type { CategoryWithCount } from "@/types/job.types";
import type { ApplicationView } from "@/modules/applications/applications.service";
import type { PaginatedItems } from "@/lib/utils/pagination";

export default function AdminApplicationsBrowser({
  categories,
  initialPage,
}: {
  categories: CategoryWithCount[];
  initialPage: PaginatedItems<ApplicationView>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [page, setPage] = useState(initialPage);
  const [error, setError] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();
  const values = useMemo(() => ({
    status: params.get("status") ?? "",
    category: params.get("category") ?? "",
    q: params.get("q") ?? "",
  }), [params]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/applications?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error ?? "Applications are unavailable.");
        setPage(result.data);
        setError(null);
      })
      .catch((reason: Error) => {
        if (reason.name !== "AbortError") setError("Applications are temporarily unavailable. Please try again.");
      });
    return () => controller.abort();
  }, [params]);

  function updateQuery(nextValues: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(nextValues)) {
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
    });
  }

  function goToPage(number: number) {
    const next = new URLSearchParams(params.toString());
    if (number > 1) next.set("page", String(number));
    else next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  return (
    <>
      <form onSubmit={submit} className="mb-4 grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
        <input name="q" defaultValue={values.q} placeholder="Search candidate or job..." className={inputClass} />
        <select name="category" defaultValue={values.category} className={inputClass}><option value="">All categories</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select>
        <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">Search</button>
      </form>
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ label: "All", value: "" }, ...APPLICATION_STATUSES.map((status) => ({ label: status, value: status }))].map((tab) => (
          <button key={tab.label} type="button" onClick={() => updateQuery({ status: tab.value })} className={cn("rounded-full border px-4 py-1.5 text-sm capitalize", values.status === tab.value ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary")}>{tab.label}</button>
        ))}
      </div>
      {loading ? <PageSkeleton rows={10} /> : error ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{error}</div> : <><ApplicantsTable applications={page.items} /><Pagination page={page} pathname={pathname} searchParams={values} /></>}
    </>
  );
}
