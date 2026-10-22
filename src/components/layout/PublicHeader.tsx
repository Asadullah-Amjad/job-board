import Link from "next/link";
import { Briefcase, Mail, Phone } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import NavLinks from "./NavLinks";
import { getCurrentUser } from "@/lib/auth/session";
import { logoutAction } from "@/actions/auth.actions";

export default async function PublicHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="bg-navy text-xs text-white">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <Mail size={14} /> info@jobhive.com
            </span>
            <span className="hidden items-center gap-2 sm:flex">
              <Phone size={14} /> +92 300 1234567
            </span>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/admin" className="hover:underline">For Employers</Link>
            <span className="opacity-40">|</span>
            <Link href="/contact" className="hover:underline">Help</Link>
            <span className="opacity-40">|</span>
            <span>English</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
            <Briefcase size={24} />
          </span>
          <span className="leading-none">
            <span className="block text-3xl font-extrabold tracking-tight text-navy">
              Job<span className="text-primary">Hive</span>
            </span>
            <span className="block text-[10px] tracking-[0.3em] text-muted">Find Your Future</span>
          </span>
        </Link>

        <NavLinks className="hidden lg:flex" />

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                className={buttonClasses("outline", "px-5")}
              >
                {user.role === "admin" ? "Admin Panel" : "My Dashboard"}
              </Link>
              <form action={logoutAction}>
                <button className={buttonClasses("ghost", "px-4")}>Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonClasses("outline", "hidden px-6 sm:inline-flex")}>
                Login
              </Link>
              <Link href="/register" className={buttonClasses("primary", "px-6")}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
