"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { Field, inputClass } from "@/components/ui/Field";
import { buttonClasses } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [codeStep, setCodeStep] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const showToast = useToast();

  function requestCode(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const formData = new FormData();
    formData.set("email", email);
    startTransition(async () => {
      const result = await forgotPasswordAction({}, formData);
      if (result.error) {
        setError(result.error);
        showToast("error", result.error);
        return;
      }
      setSuccess(result.success ?? "A reset code has been sent.");
      setCodeStep(true);
      showToast("success", result.success ?? "A reset code has been sent.");
    });
  }

  function continueToReset(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Please enter the six-digit reset code from your email.");
      return;
    }
    router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
  }

  return (
    <form onSubmit={codeStep ? continueToReset : requestCode} className="space-y-4">
      <Field label="Email">
        <input type="email" name="email" required autoComplete="email" className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} disabled={codeStep} />
      </Field>
      {codeStep && (
        <Field label="Reset code">
          <input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required className={inputClass} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} autoFocus />
        </Field>
      )}
      {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
      <button type="submit" disabled={pending} className={buttonClasses("primary", "w-full")}>
        {pending ? "Please wait..." : codeStep ? "Continue to reset password" : "Send reset code"}
      </button>
    </form>
  );
}
