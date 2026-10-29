import PageTitle from "@/components/ui/PageTitle";
import AdminApplicationsBrowser from "@/components/admin/AdminApplicationsBrowser";
import { requireAdmin } from "@/lib/auth/session";
import { listApplicationsPage } from "@/modules/applications/applications.service";
import { listCategories } from "@/modules/jobs/jobs.service";
import { parsePage } from "@/lib/utils/pagination";

export default async function AdminApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string; category?: string; q?: string; page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [page, categories] = await Promise.all([
    listApplicationsPage({ status: params.status, category: params.category, q: params.q, page: parsePage(params.page), pageSize: 10 }),
    listCategories(),
  ]);
  return <><PageTitle title="Applications" /><AdminApplicationsBrowser categories={categories} initialPage={page} /></>;
}
