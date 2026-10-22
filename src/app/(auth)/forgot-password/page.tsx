import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { forgotPasswordAction } from "@/actions/auth.actions";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Forgot password?</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Enter your email and we will create a reset link.</p>
      <ActionForm action={forgotPasswordAction} submitLabel="Get reset link">
        <Field label="Email"><input type="email" name="email" required className={inputClass} /></Field>
      </ActionForm>
      <p className="mt-5 text-center text-sm"><Link href="/login" className="text-primary hover:underline">Back to login</Link></p>
    </>
  );
}
