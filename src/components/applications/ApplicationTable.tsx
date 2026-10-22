import Link from "next/link";
import type { ApplicationView } from "@/modules/applications/applications.service";
import { formatDate } from "@/lib/utils/formatDate";
import ApplicationStatusBadge from "./ApplicationStatusBadge";

export default function ApplicationTable({ applications }: { applications: ApplicationView[] }) {
  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center text-muted">
        You have not applied for any job yet.{" "}
        <Link href="/jobs" className="font-semibold text-primary hover:underline">Browse jobs</Link>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Job</th>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Applied on</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {applications.map((a) => (
            <tr key={a.id} className="border-t border-line">
              <td className="px-4 py-3 font-medium">{a.job?.title ?? "Job removed"}</td>
              <td className="px-4 py-3 text-muted">{a.job?.company ?? "-"}</td>
              <td className="px-4 py-3 text-muted">{formatDate(a.createdAt)}</td>
              <td className="px-4 py-3"><ApplicationStatusBadge status={a.status} /></td>
              <td className="px-4 py-3 text-right">
                <Link href={`/dashboard/applications/${a.id}`} className="font-medium text-primary hover:underline">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
