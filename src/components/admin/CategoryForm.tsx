"use client";

import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { createCategoryAction } from "@/actions/jobs.actions";

export default function CategoryForm() {
  return (
    <ActionForm action={createCategoryAction} submitLabel="Add category" resetOnSuccess fullWidth={false} className="rounded-lg border border-line bg-white p-5">
      <Field label="Category name">
        <input name="name" required minLength={2} placeholder="e.g. Cook" className={inputClass} />
      </Field>
    </ActionForm>
  );
}
