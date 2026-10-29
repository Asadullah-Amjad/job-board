"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase, Building2, FileText, FolderTree, Globe, LayoutDashboard, ListChecks, User, MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const icons = {
  home: LayoutDashboard,
  profile: User,
  resumes: FileText,
  applications: ListChecks,
  jobs: Briefcase,
  categories: FolderTree,
  companies: Building2,
  site: Globe,
  queries: MessageSquare,
} satisfies Record<string, LucideIcon>;

type SidebarIcon = keyof typeof icons;

export interface SidebarItem {
  href: string;
  label: string;
  icon: SidebarIcon;
  exact?: boolean;
}

export default function DashboardSidebar({ items, title }: { items: SidebarItem[]; title: string }) {
  const pathname = usePathname();
  return (
    <aside className="border-b border-line bg-white md:min-h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div className="px-5 py-5">
        <Link href="/" className="text-2xl font-extrabold text-navy">
          Job<span className="text-primary">Hive</span>
        </Link>
        <p className="mt-1 text-xs text-muted">{title}</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
        {items.map((item) => {
          const Icon = icons[item.icon] ?? LayoutDashboard;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-white" : "text-ink hover:bg-surface hover:text-primary"
              )}
            >
              <Icon size={18} /> {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
