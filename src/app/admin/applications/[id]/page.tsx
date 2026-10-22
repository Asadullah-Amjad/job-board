import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import StatusUpdateDialog from "@/components/admin/StatusUpdateDialog";
import { buttonClasses } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth/session";
import { getApplication } from "@/modules/applications/applications.service";
import { formatDate } from "@/lib/utils/formatDate";

export default async function AdminApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const app = getApplication(id);
  if (!app) notFound();
  const c = app.candidate;

  return (
    <>
      <PageTitle title={c?.name ?? "Deleted user"} subtitle={`Applied for ${app.job?.title ?? "a removed job"} on ${formatDate(app.createdAt)}`} action={<ApplicationStatusBadge status={app.status} />} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4 rounded-lg border border-line bg-white p-6 text-sm">
          <Info label="Email" value={c?.email} />
          <Info label="Phone" value={c?.phone} />
          <Info label="City" value={c?.city} />
          <Info label="Skills" value={c?.skills} />
          <Info label="About" value={c?.bio} />
          <div>
            <p className="text-muted">Cover note</p>
            <p className="mt-1 whitespace-pre-line">{app.note || "No note added."}</p>
          </div>
          {app.resume ? (
            <a href={`/api/resumes/${app.resume.id}`} className={buttonClasses("outline")}>
              <Download size={16} /> Download {app.resume.originalName}
            </a>
          ) : (
            <p className="text-muted">Resume was removed by the candidate.</p>
          )}
          <Link href="/admin/applications" className="block text-primary hover:underline">← Back to applications</Link>
        </div>
        <StatusUpdateDialog id={app.id} current={app.status} />
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-3">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value || "-"}</span>
    </div>
  );
}
