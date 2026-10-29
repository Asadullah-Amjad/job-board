import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Forgot password?</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Enter your email and we will send a six-digit reset code.</p>
      <ForgotPasswordForm />
      <p className="mt-5 text-center text-sm"><Link href="/login" className="text-primary hover:underline">Back to login</Link></p>
    </>
  );
}
