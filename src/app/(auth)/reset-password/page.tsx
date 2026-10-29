import type { Metadata } from "next";
import ActionForm from "@/components/ui/ActionForm";
import PasswordInput from "@/components/ui/PasswordInput";
import { Field } from "@/components/ui/Field";
import { resetPasswordAction } from "@/actions/auth.actions";
import Link from "next/link";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string; code?: string }> }) {
  const params = await searchParams;
  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Set a new password</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Choose a new password with at least 8 characters.</p>
      <ActionForm action={resetPasswordAction} submitLabel="Change password">
        <input type="hidden" name="email" value={params.email ?? ""} />
        <input type="hidden" name="code" value={params.code ?? ""} />
        <Field label="New password"><PasswordInput name="password" required minLength={8} autoComplete="new-password" /></Field>
        <Field label="Confirm password"><PasswordInput name="confirm" required minLength={8} autoComplete="new-password" /></Field>
      </ActionForm>
      <p className="mt-5 text-center text-sm"><Link href="/forgot-password" className="text-primary hover:underline">Request a new code</Link></p>
    </>
  );
}
