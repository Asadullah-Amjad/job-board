import PageTitle from "@/components/ui/PageTitle";
import CategoryForm from "@/components/admin/CategoryForm";
import { requireAdmin } from "@/lib/auth/session";
import { listCategoriesPage } from "@/modules/jobs/jobs.service";
import { parsePage } from "@/lib/utils/pagination";
import Pagination from "@/components/ui/Pagination";
import CategoryList from "@/components/admin/CategoryList";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const { page: pageParam } = await searchParams;
  const page = await listCategoriesPage({ page: parsePage(pageParam), pageSize: 10 });
  return (
    <>
      <PageTitle title="Categories" subtitle="A category with jobs cannot be deleted." />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <CategoryForm />
        <CategoryList categories={page.items} />
      </div>
      <Pagination page={page} pathname="/admin/categories" searchParams={{}} />
    </>
  );
}
