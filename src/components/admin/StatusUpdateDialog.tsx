"use client";

import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { updateApplicationStatusAction } from "@/actions/applications.actions";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/types/db.types";

export default function StatusUpdateDialog({ id, current }: { id: string; current: ApplicationStatus }) {
  return (
    <ActionForm action={updateApplicationStatusAction} submitLabel="Update status" className="rounded-lg border border-line bg-white p-5">
      <input type="hidden" name="id" value={id} />
      <Field label="Application status">
        <select name="status" defaultValue={current} className={`${inputClass} capitalize`}>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </Field>
    </ActionForm>
  );
}
