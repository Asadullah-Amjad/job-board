import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listCategories } from "@/modules/jobs/jobs.service";
import { getCategoryMeta } from "@/lib/categoryIcons";

export default function CategoryGrid() {
  const categories = listCategories().slice(0, 10);
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-navy">Explore Job Categories</h2>
        <Link href="/categories" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View All Categories <ArrowRight size={16} />
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10">
        {categories.map((c) => {
          const meta = getCategoryMeta(c.slug);
          const Icon = meta.icon;
          return (
            <Link
              key={c.slug}
              href={`/jobs?category=${c.slug}`}
              className="flex flex-col items-center rounded-lg border border-line bg-white px-2 py-4 text-center transition hover:border-primary hover:shadow-md"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-full ${meta.bg} ${meta.text}`}>
                <Icon size={22} />
              </span>
              <span className="mt-2 text-[13px] font-semibold leading-tight">{c.name}</span>
              <span className="mt-1 text-xs text-muted">{c.jobCount} Jobs</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
