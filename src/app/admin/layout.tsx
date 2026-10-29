import DashboardSidebar, { type SidebarItem } from "@/components/layout/DashboardSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { requireAdmin } from "@/lib/auth/session";

const items: SidebarItem[] = [
  { href: "/admin", label: "Overview", icon: "home", exact: true },
  { href: "/admin/jobs", label: "Jobs", icon: "jobs" },
  { href: "/admin/categories", label: "Categories", icon: "categories" },
  { href: "/admin/companies", label: "Companies", icon: "companies" },
  { href: "/admin/applications", label: "Applications", icon: "applications" },
  { href: "/admin/queries", label: "Queries", icon: "queries" },
  { href: "/", label: "View website", icon: "site", exact: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen bg-surface md:flex">
      <DashboardSidebar items={items} title="Admin panel" />
      <div className="min-w-0 flex-1">
        <DashboardHeader user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
