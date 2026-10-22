"use client";

import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { uploadResumeAction } from "@/actions/resumes.actions";

export default function ResumeUploader() {
  return (
    <ActionForm action={uploadResumeAction} submitLabel="Upload resume" resetOnSuccess fullWidth={false} className="rounded-lg border border-line bg-white p-5">
      <Field label="Choose file" hint="PDF, DOC or DOCX, up to 5 MB. You can keep 5 resumes.">
        <input type="file" name="file" accept=".pdf,.doc,.docx" required className={inputClass} />
      </Field>
    </ActionForm>
  );
}
