import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { saveJobAction } from "@/actions/jobs.actions";
import { JOB_TYPES, type Category, type Job } from "@/types/job.types";
import type { Company } from "@/types/company.types";
import LocationSelect from "@/components/jobs/LocationSelect";

export default function JobForm({ job, categories, companies }: { job?: Job; categories: Category[]; companies: Company[] }) {
  return (
    <ActionForm action={saveJobAction} submitLabel={job ? "Save changes" : "Publish job"} fullWidth={false} className="max-w-3xl rounded-lg border border-line bg-white p-6">
      {job && <input type="hidden" name="id" value={job.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title"><input name="title" required defaultValue={job?.title} className={inputClass} /></Field>
        <Field label="Company"><select name="company" required defaultValue={job?.company ?? companies[0]?.name} className={inputClass}><option value="">Select a company</option>{companies.map((company) => <option key={company.id} value={company.name}>{company.name}</option>)}</select></Field>
        <Field label="Gulf country or region"><LocationSelect name="location" defaultValue={job?.location} className={inputClass} /></Field>
        <Field label="Category">
          <select name="categorySlug" required defaultValue={job?.categorySlug ?? categories[0]?.slug} className={inputClass}>
            {categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
          </select>
        </Field>
        <Field label="Job type">
          <select name="type" defaultValue={job?.type ?? "Full Time"} className={inputClass}>
            {JOB_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={job?.status ?? "open"} className={inputClass}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </Field>
        <Field label="Minimum salary (PKR)"><input type="number" min={0} name="salaryMin" required defaultValue={job?.salaryMin} className={inputClass} /></Field>
        <Field label="Maximum salary (PKR)"><input type="number" min={0} name="salaryMax" required defaultValue={job?.salaryMax} className={inputClass} /></Field>
      </div>
      <Field label="Description">
        <textarea name="description" rows={6} required defaultValue={job?.description} className={inputClass} />
      </Field>
      <Field label="Requirements" hint="One requirement per line.">
        <textarea name="requirements" rows={5} defaultValue={job?.requirements} className={inputClass} />
      </Field>
    </ActionForm>
  );
}
