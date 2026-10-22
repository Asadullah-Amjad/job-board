import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="text-2xl font-bold text-navy">Page not found</h1>
      <p className="text-muted">The page you are looking for does not exist or was removed.</p>
      <Link href="/" className={buttonClasses("primary")}>Go to home</Link>
    </div>
  );
}
