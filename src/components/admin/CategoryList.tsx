"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ActionForm from "@/components/ui/ActionForm";
import ConfirmActionButton from "@/components/ui/ConfirmActionButton";
import { deleteCategoryAction, updateCategoryAction } from "@/actions/jobs.actions";
import { inputClass } from "@/components/ui/Field";
import type { CategoryWithCount } from "@/types/job.types";
import { buttonClasses } from "@/components/ui/Button";

export default function CategoryList({ categories }: { categories: CategoryWithCount[] }) {
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const router = useRouter();
  return (
    <>
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-muted"><tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Jobs</th><th className="px-4 py-3" /></tr></thead>
          <tbody>
            {categories.map((category) => <tr key={category.slug} className="border-t border-line">
              <td className="px-4 py-3 font-medium">{category.name}</td>
              <td className="px-4 py-3 text-muted">{category.jobCount}</td>
              <td className="px-4 py-3 text-right"><div className="flex justify-end gap-4">
                <button type="button" onClick={() => setEditing(category)} className="font-medium text-primary hover:underline">Edit</button>
                {category.jobCount === 0 && <ConfirmActionButton action={deleteCategoryAction} fields={{ slug: category.slug }} message={`Delete category "${category.name}"?`} className="font-medium text-red-600 hover:underline">Delete</ConfirmActionButton>}
              </div></td>
            </tr>)}
          </tbody>
        </table>
        {categories.length === 0 && <div className="p-10 text-center text-muted">No categories found.</div>}
      </div>
      {editing && <div className="fixed inset-0 z-50 bg-black/40" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
        <aside className="ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold text-navy">Edit category</h2><button type="button" onClick={() => setEditing(null)} className={buttonClasses("ghost")}>Close</button></div>
          <ActionForm action={updateCategoryAction} submitLabel="Save changes" onSuccess={() => { setEditing(null); router.refresh(); }}>
            <input type="hidden" name="slug" value={editing.slug} />
            <label className="block text-sm font-medium">Category name<input name="name" defaultValue={editing.name} required minLength={2} className={`${inputClass} mt-1`} /></label>
          </ActionForm>
        </aside>
      </div>}
    </>
  );
}
