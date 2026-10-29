"use client";

import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { createCompanyAction } from "@/actions/companies.actions";

export default function CompanyForm() {
  return (
    <ActionForm action={createCompanyAction} submitLabel="Add company" resetOnSuccess fullWidth={false} className="rounded-lg border border-line bg-white p-5">
      <Field label="Company name"><input name="name" required minLength={2} placeholder="e.g. Gulf Transport Co." className={inputClass} /></Field>
    </ActionForm>
  );
}
