import Link from "next/link";
import { notFound } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import { requireUser } from "@/lib/auth/session";
import { getApplication } from "@/modules/applications/applications.service";
import { formatDate } from "@/lib/utils/formatDate";
import { formatSalary } from "@/lib/utils/formatSalary";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const app = await getApplication(id);
  if (!app || app.userId !== user.id) notFound();

  return (
    <>
      <PageTitle title={app.job?.title ?? "Job removed"} subtitle={app.job ? `${app.job.company} · ${app.job.location}` : undefined} action={<ApplicationStatusBadge status={app.status} />} />
      <div className="max-w-2xl space-y-4 rounded-lg border border-line bg-white p-6 text-sm">
        <Row label="Applied on" value={formatDate(app.createdAt)} />
        <Row label="Last update" value={formatDate(app.updatedAt)} />
        {app.job && <Row label="Salary" value={formatSalary(app.job.salaryMin, app.job.salaryMax)} />}
        <Row label="Resume" value={app.resume ? app.resume.originalName : "Removed"} />
        <div>
          <p className="text-muted">Your cover note</p>
          <p className="mt-1 whitespace-pre-line">{app.note || "No note added."}</p>
        </div>
        {app.job && <Link href={`/jobs/${app.job.slug}`} className="font-medium text-primary hover:underline">View job post</Link>}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-3">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
