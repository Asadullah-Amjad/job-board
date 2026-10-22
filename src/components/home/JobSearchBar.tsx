import { ChevronDown, MapPin, Search, Briefcase } from "lucide-react";
import type { Category } from "@/types/job.types";

// Plain GET form: /jobs?q=...&location=...&category=...
export default function JobSearchBar({ categories }: { categories: Category[] }) {
  return (
    <form
      action="/jobs"
      method="GET"
      className="flex w-full max-w-3xl flex-col gap-2 rounded-xl bg-white p-2 shadow-lg shadow-blue-900/10 md:flex-row md:items-center"
    >
      <label className="flex flex-1 items-center gap-3 px-3 py-2">
        <Briefcase size={18} className="text-muted" />
        <input name="q" placeholder="Job title, keywords..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
      </label>
      <label className="flex flex-1 items-center gap-3 border-line px-3 py-2 md:border-l">
        <MapPin size={18} className="text-muted" />
        <input name="location" placeholder="City, location..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
      </label>
      <label className="relative flex flex-1 items-center border-line px-3 py-2 md:border-l">
        <select name="category" defaultValue="" className="w-full appearance-none bg-transparent text-sm text-muted outline-none">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 text-muted" />
      </label>
      <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
        <Search size={18} /> Search Jobs
      </button>
    </form>
  );
}
