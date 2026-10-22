import Link from "next/link";
import type { ApplicationView } from "@/modules/applications/applications.service";
import { formatDate } from "@/lib/utils/formatDate";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";

export default function ApplicantsTable({ applications }: { applications: ApplicationView[] }) {
  if (applications.length === 0)
    return <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center text-muted">No applications found.</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Candidate</th>
            <th className="px-4 py-3 font-medium">Job</th>
            <th className="px-4 py-3 font-medium">Applied on</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {applications.map((a) => (
            <tr key={a.id} className="border-t border-line">
              <td className="px-4 py-3">
                <p className="font-medium">{a.candidate?.name ?? "Deleted user"}</p>
                <p className="text-xs text-muted">{a.candidate?.email}</p>
              </td>
              <td className="px-4 py-3 text-muted">{a.job?.title ?? "Job removed"}</td>
              <td className="px-4 py-3 text-muted">{formatDate(a.createdAt)}</td>
              <td className="px-4 py-3"><ApplicationStatusBadge status={a.status} /></td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/applications/${a.id}`} className="font-medium text-primary hover:underline">Review</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
