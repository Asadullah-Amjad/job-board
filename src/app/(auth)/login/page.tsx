import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { loginAction } from "@/actions/auth.actions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");
  const { next = "", reset } = await searchParams;

  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Login to apply for jobs and track your applications.</p>
      {reset && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Password changed. Please login.</p>}
      <ActionForm action={loginAction} submitLabel="Login">
        <input type="hidden" name="next" value={next} />
        <Field label="Email"><input type="email" name="email" required autoComplete="email" className={inputClass} /></Field>
        <Field label="Password"><input type="password" name="password" required autoComplete="current-password" className={inputClass} /></Field>
        <div className="text-right text-sm"><Link href="/forgot-password" className="text-primary hover:underline">Forgot password?</Link></div>
      </ActionForm>
      <p className="mt-5 text-center text-sm text-muted">
        New here? <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link>
      </p>
    </>
  );
}
