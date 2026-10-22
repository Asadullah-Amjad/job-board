import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import ApplicantsTable from "@/components/admin/ApplicantsTable";
import { requireAdmin } from "@/lib/auth/session";
import { listApplications } from "@/modules/applications/applications.service";
import { APPLICATION_STATUSES } from "@/types/db.types";
import { cn } from "@/lib/utils/cn";
import { paginate, parsePage } from "@/lib/utils/pagination";
import Pagination from "@/components/ui/Pagination";

export default async function AdminApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  await requireAdmin();
  const { status, page: pageParam } = await searchParams;
  const page = paginate(listApplications({ status }), parsePage(pageParam), 10);
  const tabs = [{ label: "All", value: "" }, ...APPLICATION_STATUSES.map((s) => ({ label: s, value: s }))];

  return (
    <>
      <PageTitle title="Applications" />
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link key={t.label} href={t.value ? `/admin/applications?status=${t.value}` : "/admin/applications"}
            className={cn("rounded-full border px-4 py-1.5 text-sm capitalize", (status ?? "") === t.value ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary")}>
            {t.label}
          </Link>
        ))}
      </div>
      <ApplicantsTable applications={page.items} />
      <Pagination page={page} pathname="/admin/applications" searchParams={{ status }} />
    </>
  );
}
