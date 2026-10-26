import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ApplicationTable from "@/components/applications/ApplicationTable";
import { requireUser } from "@/lib/auth/session";
import { listApplications } from "@/modules/applications/applications.service";
import { paginate, parsePage } from "@/lib/utils/pagination";
import Pagination from "@/components/ui/Pagination";

export const metadata: Metadata = { title: "My applications" };

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireUser();
  const { page: pageParam } = await searchParams;
  const applications = await listApplications({ userId: user.id });
  const page = paginate(applications, parsePage(pageParam), 10);
  return (
    <>
      <PageTitle title="My applications" />
      <ApplicationTable applications={page.items} />
      <Pagination page={page} pathname="/dashboard/applications" searchParams={{}} />
    </>
  );
}
