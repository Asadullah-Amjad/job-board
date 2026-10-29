import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import AdminJobsBrowser from "@/components/admin/AdminJobsBrowser";
import { buttonClasses } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth/session";
import { listCategories, listJobsPage } from "@/modules/jobs/jobs.service";
import { parsePage } from "@/lib/utils/pagination";

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; category?: string; status?: string; sort?: string; direction?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [page, categories] = await Promise.all([
    listJobsPage({
      includeClosed: true,
      admin: true,
      page: parsePage(params.page),
      pageSize: 10,
      q: params.q,
      category: params.category,
      status: params.status === "closed" || params.status === "open" ? params.status : undefined,
      sort: params.sort === "title" ? "title" : "created_at",
      direction: params.direction === "asc" ? "asc" : "desc",
    }),
    listCategories(),
  ]);
  return (
    <>
      <PageTitle title="Jobs" action={<Link href="/admin/jobs/new" className={buttonClasses("primary")}>Post new job</Link>} />
      <AdminJobsBrowser initialData={{ page, categories }} />
    </>
  );
}
