import Link from "next/link";
import { inputClass } from "@/components/ui/Field";
import { buttonClasses } from "@/components/ui/Button";
import { JOB_TYPES, type Category } from "@/types/job.types";

export default function JobFilters({
  categories,
  values,
}: {
  categories: Category[];
  values: { q?: string; location?: string; category?: string; type?: string };
}) {
  return (
    <form action="/jobs" method="GET" className="space-y-4 rounded-lg border border-line bg-white p-5">
      <h2 className="font-bold text-navy">Filter jobs</h2>
      <label className="block text-sm font-medium">
        Keyword
        <input name="q" defaultValue={values.q} placeholder="Job title, company" className={`${inputClass} mt-1 font-normal`} />
      </label>
      <label className="block text-sm font-medium">
        Location
        <input name="location" defaultValue={values.location} placeholder="City" className={`${inputClass} mt-1 font-normal`} />
      </label>
      <label className="block text-sm font-medium">
        Category
        <select name="category" defaultValue={values.category ?? ""} className={`${inputClass} mt-1 font-normal`}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Job type
        <select name="type" defaultValue={values.type ?? ""} className={`${inputClass} mt-1 font-normal`}>
          <option value="">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <button type="submit" className={buttonClasses("primary", "flex-1")}>Apply filters</button>
        <Link href="/jobs" className={buttonClasses("outline")}>Reset</Link>
      </div>
    </form>
  );
}
