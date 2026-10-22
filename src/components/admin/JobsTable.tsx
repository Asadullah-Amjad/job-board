import Link from "next/link";
import type { Category, Job } from "@/types/job.types";
import { formatDate } from "@/lib/utils/formatDate";
import { formatSalary } from "@/lib/utils/formatSalary";
import { Badge } from "@/components/ui/Badge";
import ConfirmActionButton from "@/components/ui/ConfirmActionButton";
import { deleteJobAction } from "@/actions/jobs.actions";

export default function JobsTable({ jobs, categories }: { jobs: Job[]; categories: Category[] }) {
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  if (jobs.length === 0)
    return <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center text-muted">No jobs yet. Click “Post new job”.</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Job</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Salary</th>
            <th className="px-4 py-3 font-medium">Posted</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} className="border-t border-line">
              <td className="px-4 py-3">
                <Link href={`/jobs/${j.slug}`} className="font-medium hover:text-primary">{j.title}</Link>
                <p className="text-xs text-muted">{j.company} · {j.location}</p>
              </td>
              <td className="px-4 py-3 text-muted">{catName(j.categorySlug)}</td>
              <td className="px-4 py-3 text-muted">{formatSalary(j.salaryMin, j.salaryMax)}</td>
              <td className="px-4 py-3 text-muted">{formatDate(j.createdAt)}</td>
              <td className="px-4 py-3"><Badge tone={j.status === "open" ? "green" : "gray"} className="capitalize">{j.status}</Badge></td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-4">
                  <Link href={`/admin/jobs/${j.id}/edit`} className="font-medium text-primary hover:underline">Edit</Link>
                  <ConfirmActionButton action={deleteJobAction} fields={{ id: j.id }} message={`Delete "${j.title}" and its applications?`} className="font-medium text-red-600 hover:underline">Delete</ConfirmActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
