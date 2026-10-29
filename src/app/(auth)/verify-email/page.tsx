import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { verifyEmailAction, resendVerificationAction } from "@/actions/auth.actions";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;
  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Verify your email</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Enter the six-digit code sent to your email.</p>
      <ActionForm action={verifyEmailAction} submitLabel="Verify email">
        <Field label="Email"><input type="email" name="email" required defaultValue={email} className={inputClass} /></Field>
        <Field label="Verification code"><input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required className={inputClass} /></Field>
      </ActionForm>
      <ActionForm action={resendVerificationAction} submitLabel="Resend code" fullWidth={false} className="mt-4">
        <input type="hidden" name="email" value={email} />
      </ActionForm>
      <p className="mt-5 text-center text-sm"><Link href="/login" className="text-primary hover:underline">Back to login</Link></p>
    </>
  );
}
