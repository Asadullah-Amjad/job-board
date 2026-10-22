"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/types/api.types";
import { useToast } from "@/components/ui/ToastProvider";
import { buttonClasses } from "./Button";

export default function ConfirmActionButton({
  action,
  fields,
  message,
  className,
  children,
}: {
  action: (fd: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const showToast = useToast();

  function confirm() {
    const formData = new FormData();
    for (const [name, value] of Object.entries(fields)) formData.set(name, value);
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        showToast("error", result.error);
        return;
      }
      showToast("success", result.success ?? "Done.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !pending) setOpen(false);
        }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-action-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 id="confirm-action-title" className="text-lg font-bold text-navy">Please confirm</h2>
            <p className="mt-2 text-sm text-muted">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={pending} onClick={() => setOpen(false)} className={buttonClasses("outline")}>Cancel</button>
              <button type="button" disabled={pending} onClick={confirm} className={buttonClasses("danger")}>
                {pending ? "Please wait..." : "Confirm"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
