"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ActionState } from "@/types/api.types";
import { buttonClasses } from "./Button";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/ToastProvider";

// Server action ko form se jorta hai: error/success message, loading state.
// onSubmit use kiya hai taake error par form ke fields clear na hon.
export default function ActionForm({
  action,
  submitLabel,
  children,
  className,
  resetOnSuccess,
  fullWidth = true,
  onSuccess,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  fullWidth?: boolean;
  onSuccess?: () => void;
}) {
  const [state, setState] = useState<ActionState>({});
  const [pending, start] = useTransition();
  const showToast = useToast();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    start(async () => {
      const res = await action(state, fd);
      setState(res ?? {});
      if (res?.error) showToast("error", res.error);
      if (res?.success) showToast("success", res.success);
      if (res?.success) {
        if (resetOnSuccess) form.reset();
        onSuccess?.();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      {children}
      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}{" "}
          {state.link && (
            <Link href={state.link} className="font-semibold underline">
              Open reset link
            </Link>
          )}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClasses("primary", fullWidth ? "w-full" : "")}>
        {pending ? "Please wait..." : submitLabel}
      </button>
    </form>
  );
}
