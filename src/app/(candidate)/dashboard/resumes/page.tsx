import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import ResumeUploader from "@/components/resumes/ResumeUploader";
import ConfirmActionButton from "@/components/ui/ConfirmActionButton";
import { deleteResumeAction } from "@/actions/resumes.actions";
import { requireUser } from "@/lib/auth/session";
import { listResumes } from "@/modules/resumes/resumes.service";
import { formatDate } from "@/lib/utils/formatDate";

export const metadata: Metadata = { title: "My resumes" };

export default async function ResumesPage() {
  const user = await requireUser();
  const resumes = await listResumes(user.id);
  return (
    <>
      <PageTitle title="My resumes" subtitle="Upload your CV once and use it for every application." />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <ResumeUploader />
        <div className="space-y-3">
          {resumes.length === 0 && <p className="rounded-lg border border-dashed border-line bg-white p-8 text-center text-muted">No resumes yet.</p>}
          {resumes.map((r) => (
            <div key={r.id} className="flex items-center gap-4 rounded-lg border border-line bg-white p-4">
              <FileText className="text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.originalName}</p>
                <p className="text-xs text-muted">{(r.size / 1024).toFixed(0)} KB · {formatDate(r.createdAt)}</p>
              </div>
              <a href={`/api/resumes/${r.id}`} className="text-primary hover:text-primary-dark" aria-label="Download"><Download size={18} /></a>
              <ConfirmActionButton action={deleteResumeAction} fields={{ id: r.id }} message="Delete this resume?" className="text-sm font-medium text-red-600 hover:underline">Delete</ConfirmActionButton>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
