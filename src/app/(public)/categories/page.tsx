import type { Metadata } from "next";
import Link from "next/link";
import { listCategories } from "@/modules/jobs/jobs.service";
import { getCategoryMeta } from "@/lib/categoryIcons";

export const metadata: Metadata = { title: "Job Categories" };

export default function CategoriesPage() {
  const categories = listCategories();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Job Categories</h1>
      <p className="mt-2 text-muted">Pick a category to see open jobs.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => {
          const meta = getCategoryMeta(c.slug);
          const Icon = meta.icon;
          return (
            <Link key={c.slug} href={`/jobs?category=${c.slug}`} className="flex items-center gap-4 rounded-lg border border-line bg-white p-5 transition hover:border-primary hover:shadow-md">
              <span className={`flex h-14 w-14 items-center justify-center rounded-full ${meta.bg} ${meta.text}`}>
                <Icon size={26} />
              </span>
              <span>
                <span className="block font-semibold">{c.name}</span>
                <span className="text-sm text-muted">{c.jobCount} open {c.jobCount === 1 ? "job" : "jobs"}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
