import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import PasswordInput from "@/components/ui/PasswordInput";
import { registerAction } from "@/actions/auth.actions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Create your account</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Free for job seekers. Takes one minute.</p>
      <ActionForm action={registerAction} submitLabel="Create account">
        <Field label="Full name"><input name="name" required autoComplete="name" className={inputClass} /></Field>
        <Field label="Email"><input type="email" name="email" required autoComplete="email" className={inputClass} /></Field>
        <Field label="Password" hint="At least 8 characters."><PasswordInput name="password" required minLength={8} autoComplete="new-password" /></Field>
        <Field label="Confirm password"><PasswordInput name="confirm" required minLength={8} autoComplete="new-password" /></Field>
      </ActionForm>
      <p className="mt-5 text-center text-sm text-muted">
        Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Login</Link>
      </p>
    </>
  );
}
