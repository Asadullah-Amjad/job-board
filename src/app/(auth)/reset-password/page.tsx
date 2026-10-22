import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { resetPasswordAction } from "@/actions/auth.actions";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token)
    return (
      <>
        <h1 className="text-2xl font-bold text-navy">Invalid link</h1>
        <p className="mt-2 text-muted">This reset link is missing its token.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-primary hover:underline">Request a new link</Link>
      </>
    );

  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Set a new password</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Choose a password with at least 8 characters.</p>
      <ActionForm action={resetPasswordAction} submitLabel="Change password">
        <input type="hidden" name="token" value={token} />
        <Field label="New password"><input type="password" name="password" required minLength={8} className={inputClass} /></Field>
        <Field label="Confirm password"><input type="password" name="confirm" required minLength={8} className={inputClass} /></Field>
      </ActionForm>
    </>
  );
}
