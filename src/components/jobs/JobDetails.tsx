import Link from "next/link";
import { Building2, CalendarDays, Clock, MapPin, Wallet } from "lucide-react";
import type { Job } from "@/types/job.types";
import type { SafeUser } from "@/types/db.types";
import { formatSalary } from "@/lib/utils/formatSalary";
import { formatDate } from "@/lib/utils/formatDate";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { typeTone } from "./JobCard";
import ApplyJobDialog from "./ApplyJobDialog";

export default function JobDetails({
  job,
  categoryName,
  user,
  applied,
  resumes,
}: {
  job: Job;
  categoryName: string;
  user: SafeUser | null;
  applied: boolean;
  resumes: { id: string; name: string }[];
}) {
  const requirements = job.requirements.split("\n").map((r) => r.trim()).filter(Boolean);

  let action: React.ReactNode;
  if (job.status === "closed") {
    action = <p className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm text-muted">This job is closed.</p>;
  } else if (!user) {
    action = (
      <Link href={`/login?next=${encodeURIComponent(`/jobs/${job.slug}`)}`} className={buttonClasses("primary", "w-full py-3")}>
        Login to apply
      </Link>
    );
  } else if (user.role !== "user") {
    action = <p className="text-center text-sm text-muted">Admin accounts cannot apply for jobs.</p>;
  } else if (applied) {
    action = (
      <Link href="/dashboard/applications" className={buttonClasses("outline", "w-full py-3")}>
        Applied · View status
      </Link>
    );
  } else if (resumes.length === 0) {
    action = (
      <Link href="/dashboard/resumes" className={buttonClasses("primary", "w-full py-3")}>
        Upload a resume to apply
      </Link>
    );
  } else {
    action = <ApplyJobDialog jobId={job.id} jobTitle={job.title} resumes={resumes} />;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px]">
      <div>
        <Link href="/jobs" className="text-sm text-primary hover:underline">← Back to jobs</Link>
        <h1 className="mt-3 text-3xl font-extrabold text-navy">{job.title}</h1>
        <p className="mt-1 flex items-center gap-2 text-muted">
          <Building2 size={16} /> {job.company}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="flex items-center gap-1"><MapPin size={15} /> {job.location}</span>
          <Badge tone={typeTone[job.type]}>{job.type}</Badge>
          <Badge tone="blue">{categoryName}</Badge>
        </div>

        <h2 className="mt-8 text-lg font-bold text-navy">Job description</h2>
        <div className="mt-2 space-y-3 leading-relaxed text-ink/90">
          {job.description.split(/\n\s*\n/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {requirements.length > 0 && (
          <>
            <h2 className="mt-8 text-lg font-bold text-navy">Requirements</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {requirements.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <aside className="h-fit space-y-4 rounded-xl border border-line bg-white p-5 shadow-sm lg:sticky lg:top-28">
        <p className="flex items-center gap-2 text-lg font-bold">
          <Wallet size={20} className="text-primary" /> {formatSalary(job.salaryMin, job.salaryMax)}
        </p>
        <p className="flex items-center gap-2 text-sm text-muted"><Clock size={16} /> {job.type}</p>
        <p className="flex items-center gap-2 text-sm text-muted"><CalendarDays size={16} /> Posted {formatDate(job.createdAt)}</p>
        {action}
      </aside>
    </div>
  );
}
