import { logoutAction } from "@/actions/auth.actions";
import { buttonClasses } from "@/components/ui/Button";
import type { SafeUser } from "@/types/db.types";

export default function DashboardHeader({ user }: { user: SafeUser }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
      <p className="text-sm text-muted">
        Signed in as <span className="font-semibold text-ink">{user.name}</span>
      </p>
      <form action={logoutAction}>
        <button className={buttonClasses("outline", "px-4 py-2")}>Logout</button>
      </form>
    </header>
  );
}
