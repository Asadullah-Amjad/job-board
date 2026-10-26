import PageTitle from "@/components/ui/PageTitle";
import CategoryForm from "@/components/admin/CategoryForm";
import ConfirmActionButton from "@/components/ui/ConfirmActionButton";
import { deleteCategoryAction } from "@/actions/jobs.actions";
import { requireAdmin } from "@/lib/auth/session";
import { listCategories } from "@/modules/jobs/jobs.service";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await listCategories();
  return (
    <>
      <PageTitle title="Categories" subtitle="A category with jobs cannot be deleted." />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <CategoryForm />
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Jobs</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const total = c.jobCount;
                return (
                  <tr key={c.slug} className="border-t border-line">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted">{total}</td>
                    <td className="px-4 py-3 text-right">
                      {total === 0 && (
                        <ConfirmActionButton action={deleteCategoryAction} fields={{ slug: c.slug }} message={`Delete category "${c.name}"?`} className="font-medium text-red-600 hover:underline">Delete</ConfirmActionButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
