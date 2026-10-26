import type { Metadata } from "next";
import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { resetPasswordAction } from "@/actions/auth.actions";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Set a new password</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Choose a password with at least 8 characters.</p>
      <ActionForm action={resetPasswordAction} submitLabel="Change password">
        <Field label="New password"><input type="password" name="password" required minLength={8} className={inputClass} /></Field>
        <Field label="Confirm password"><input type="password" name="confirm" required minLength={8} className={inputClass} /></Field>
      </ActionForm>
    </>
  );
}
