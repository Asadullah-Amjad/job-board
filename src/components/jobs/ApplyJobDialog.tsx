"use client";

import { useState } from "react";
import { X } from "lucide-react";
import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { buttonClasses } from "@/components/ui/Button";
import { applyAction } from "@/actions/applications.actions";

export default function ApplyJobDialog({
  jobId,
  jobTitle,
  resumes,
}: {
  jobId: string;
  jobTitle: string;
  resumes: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className={buttonClasses("primary", "w-full py-3")}>
        Apply Now
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={`Apply for ${jobTitle}`}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-navy">Apply for {jobTitle}</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <ActionForm action={applyAction} submitLabel="Submit application" onSuccess={() => setOpen(false)}>
              <input type="hidden" name="jobId" value={jobId} />
              <Field label="Select resume">
                <select name="resumeId" required className={inputClass} defaultValue={resumes[0]?.id}>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Cover note (optional)">
                <textarea name="note" rows={4} maxLength={1000} className={inputClass} placeholder="Tell the employer why you are a good fit." />
              </Field>
            </ActionForm>
          </div>
        </div>
      )}
    </>
  );
}
