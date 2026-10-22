import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="mt-16 bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <p className="text-2xl font-extrabold">
            Job<span className="text-blue-400">Hive</span>
          </p>
          <p className="mt-3 text-sm text-blue-100/80">
            Pakistan ka job board. Naukri talash karein ya sahi candidate dhundein.
          </p>
        </div>
        <div>
          <p className="font-semibold">Job Seekers</p>
          <ul className="mt-3 space-y-2 text-sm text-blue-100/80">
            <li><Link href="/jobs" className="hover:text-white">Browse Jobs</Link></li>
            <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
            <li><Link href="/register" className="hover:text-white">Create Account</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Employers</p>
          <ul className="mt-3 space-y-2 text-sm text-blue-100/80">
            <li><Link href="/admin/jobs/new" className="hover:text-white">Post a Job</Link></li>
            <li><Link href="/admin" className="hover:text-white">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-blue-100/80">
            <li>info@jobhive.com</li>
            <li>+92 300 1234567</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-blue-100/70">
        © {new Date().getFullYear()} JobHive. All rights reserved.
      </div>
    </footer>
  );
}
