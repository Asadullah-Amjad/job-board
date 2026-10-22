import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import JobsTable from "@/components/admin/JobsTable";
import { buttonClasses } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth/session";
import { listCategories, listJobs } from "@/modules/jobs/jobs.service";
import { paginate, parsePage } from "@/lib/utils/pagination";
import Pagination from "@/components/ui/Pagination";

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const { page: pageParam } = await searchParams;
  const page = paginate(listJobs({ includeClosed: true }), parsePage(pageParam), 10);
  return (
    <>
      <PageTitle title="Jobs" action={<Link href="/admin/jobs/new" className={buttonClasses("primary")}>Post new job</Link>} />
      <JobsTable jobs={page.items} categories={listCategories()} />
      <Pagination page={page} pathname="/admin/jobs" searchParams={{}} />
    </>
  );
}
