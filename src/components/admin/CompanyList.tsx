"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ActionForm from "@/components/ui/ActionForm";
import ConfirmActionButton from "@/components/ui/ConfirmActionButton";
import { deleteCompanyAction, updateCompanyAction } from "@/actions/companies.actions";
import { buttonClasses } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import type { CompanyWithCount } from "@/types/company.types";

export default function CompanyList({ companies }: { companies: CompanyWithCount[] }) {
  const [editing, setEditing] = useState<CompanyWithCount | null>(null);
  const router = useRouter();
  return (
    <>
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-muted"><tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Jobs</th><th className="px-4 py-3" /></tr></thead>
          <tbody>{companies.map((company) => <tr key={company.id} className="border-t border-line">
            <td className="px-4 py-3 font-medium">{company.name}</td>
            <td className="px-4 py-3 text-muted">{company.jobCount}</td>
            <td className="px-4 py-3 text-right"><div className="flex justify-end gap-4">
              <button type="button" onClick={() => setEditing(company)} className="font-medium text-primary hover:underline">Edit</button>
              {company.jobCount === 0 && <ConfirmActionButton action={deleteCompanyAction} fields={{ id: company.id }} message={`Delete company "${company.name}"?`} className="font-medium text-red-600 hover:underline">Delete</ConfirmActionButton>}
            </div></td>
          </tr>)}</tbody>
        </table>
        {companies.length === 0 && <div className="p-10 text-center text-muted">No companies found.</div>}
      </div>
      {editing && <div className="fixed inset-0 z-50 bg-black/40" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
        <aside className="ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold text-navy">Edit company</h2><button type="button" onClick={() => setEditing(null)} className={buttonClasses("ghost")}>Close</button></div>
          <ActionForm action={updateCompanyAction} submitLabel="Save changes" onSuccess={() => { setEditing(null); router.refresh(); }}>
            <input type="hidden" name="id" value={editing.id} />
            <label className="block text-sm font-medium">Company name<input name="name" defaultValue={editing.name} required minLength={2} className={`${inputClass} mt-1`} /></label>
          </ActionForm>
        </aside>
      </div>}
    </>
  );
}
