import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import ApplicationTable from "@/components/applications/ApplicationTable";
import { buttonClasses } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth/session";
import { listApplications } from "@/modules/applications/applications.service";
import { listResumes } from "@/modules/resumes/resumes.service";

export default async function DashboardPage() {
  const user = await requireUser();
  const [apps, resumes] = await Promise.all([
    listApplications({ userId: user.id }),
    listResumes(user.id),
  ]);
  const profileDone = Boolean(user.phone && user.city && user.skills);

  const stats = [
    { label: "Applications", value: apps.length },
    { label: "Shortlisted / Hired", value: apps.filter((a) => a.status === "shortlisted" || a.status === "hired").length },
    { label: "Resumes uploaded", value: resumes.length },
  ];

  return (
    <>
      <PageTitle title={`Hello, ${user.name.split(" ")[0]}`} subtitle="Here is a quick look at your job search." action={<Link href="/jobs" className={buttonClasses("primary")}>Find jobs</Link>} />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-line bg-white p-5">
            <p className="text-3xl font-extrabold text-navy">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {(!profileDone || resumes.length === 0) && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Complete your profile and upload a resume to apply faster.{" "}
          <Link href="/dashboard/profile" className="font-semibold underline">Profile</Link> ·{" "}
          <Link href="/dashboard/resumes" className="font-semibold underline">Resumes</Link>
        </div>
      )}

      <h2 className="mt-8 mb-3 text-lg font-bold text-navy">Recent applications</h2>
      <ApplicationTable applications={apps.slice(0, 5)} />
    </>
  );
}
