import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10">
      <Link href="/" className="mb-6 text-3xl font-extrabold text-navy">
        Job<span className="text-primary">Hive</span>
      </Link>
      <div className="w-full max-w-md rounded-xl border border-line bg-white p-7 shadow-sm">{children}</div>
    </div>
  );
}
