import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import ApplicantsTable from "@/components/admin/ApplicantsTable";
import { buttonClasses } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth/session";
import { applicationStats, listApplications } from "@/modules/applications/applications.service";

export default async function AdminHomePage() {
  await requireAdmin();
  const s = await applicationStats();
  const cards = [
    { label: "Total jobs", value: s.jobs },
    { label: "Open jobs", value: s.openJobs },
    { label: "Applications", value: s.total },
    { label: "Pending review", value: s.pending },
    { label: "Candidates", value: s.candidates },
  ];
  return (
    <>
      <PageTitle title="Overview" action={<Link href="/admin/jobs/new" className={buttonClasses("primary")}>Post new job</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-line bg-white p-5">
            <p className="text-3xl font-extrabold text-navy">{c.value}</p>
            <p className="text-sm text-muted">{c.label}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-8 mb-3 text-lg font-bold text-navy">Latest applications</h2>
      <ApplicantsTable applications={(await listApplications()).slice(0, 5)} />
    </>
  );
}
