import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginatedItems } from "@/lib/utils/pagination";

export default function Pagination({
  page,
  pathname,
  searchParams = {},
}: {
  page: PaginatedItems<unknown>;
  pathname: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (page.totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `${pathname}?${params.toString()}`;
  }

  const firstVisible = Math.max(1, Math.min(page.currentPage - 2, page.totalPages - 4));
  const lastVisible = Math.min(page.totalPages, firstVisible + 4);

  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        Showing {page.start}–{page.end} of {page.totalItems}
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={hrefFor(page.currentPage - 1)}
          aria-label="Previous page"
          aria-disabled={page.currentPage === 1}
          className={`rounded-md border border-line p-2 ${page.currentPage === 1 ? "pointer-events-none opacity-40" : "hover:bg-surface"}`}
          tabIndex={page.currentPage === 1 ? -1 : undefined}
        >
          <ChevronLeft size={16} />
        </Link>
        {Array.from({ length: lastVisible - firstVisible + 1 }, (_, index) => firstVisible + index).map((number) => (
          <Link
            key={number}
            href={hrefFor(number)}
            aria-current={number === page.currentPage ? "page" : undefined}
            className={`min-w-9 rounded-md border px-3 py-2 text-center text-sm ${number === page.currentPage ? "border-primary bg-primary text-white" : "border-line hover:bg-surface"}`}
          >
            {number}
          </Link>
        ))}
        <Link
          href={hrefFor(page.currentPage + 1)}
          aria-label="Next page"
          aria-disabled={page.currentPage === page.totalPages}
          className={`rounded-md border border-line p-2 ${page.currentPage === page.totalPages ? "pointer-events-none opacity-40" : "hover:bg-surface"}`}
          tabIndex={page.currentPage === page.totalPages ? -1 : undefined}
        >
          <ChevronRight size={16} />
        </Link>
      </div>
    </nav>
  );
}
