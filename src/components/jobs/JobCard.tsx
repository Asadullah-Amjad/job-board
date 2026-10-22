import Link from "next/link";
import { MapPin } from "lucide-react";
import { isNewJob, type Job } from "@/types/job.types";
import { getCategoryMeta } from "@/lib/categoryIcons";
import { formatSalary } from "@/lib/utils/formatSalary";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";

export const typeTone = { "Full Time": "green", "Part Time": "amber", Contract: "violet" } as const;

export default function JobCard({ job }: { job: Job }) {
  const meta = getCategoryMeta(job.categorySlug);
  const Icon = meta.icon;

  return (
    <article className="relative flex flex-col rounded-lg border border-line bg-white p-4 shadow-sm transition hover:shadow-md">
      {isNewJob(job) && (
        <span className="absolute right-3 top-0 rounded-b bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">New</span>
      )}
      <div className="flex gap-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.text}`}>
          <Icon size={24} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-bold">{job.title}</h3>
          <p className="truncate text-xs text-muted">{job.company}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted">
            <MapPin size={12} /> {job.location}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <Badge tone={typeTone[job.type]}>{job.type}</Badge>
      </div>
      <p className="mt-2 text-sm font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</p>
      <Link href={`/jobs/${job.slug}`} className={buttonClasses("primary", "mt-auto w-full")}>
        Apply Now
      </Link>
    </article>
  );
}
