import { redirect } from "next/navigation";
import DashboardSidebar, { type SidebarItem } from "@/components/layout/DashboardSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { requireUser } from "@/lib/auth/session";

const items: SidebarItem[] = [
  { href: "/dashboard", label: "Overview", icon: "home", exact: true },
  { href: "/dashboard/applications", label: "My Applications", icon: "applications" },
  { href: "/dashboard/resumes", label: "My Resumes", icon: "resumes" },
  { href: "/dashboard/profile", label: "Profile", icon: "profile" },
  { href: "/jobs", label: "Browse Jobs", icon: "jobs" },
];

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");
  return (
    <div className="min-h-screen bg-surface md:flex">
      <DashboardSidebar items={items} title="Candidate dashboard" />
      <div className="min-w-0 flex-1">
        <DashboardHeader user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
