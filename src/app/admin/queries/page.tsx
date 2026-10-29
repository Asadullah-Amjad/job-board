import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import Pagination from "@/components/ui/Pagination";
import ApplicantsTable from "@/components/admin/ApplicantsTable";
import { requireAdmin } from "@/lib/auth/session";
import { listContactMessagesPage } from "@/modules/auth/auth.service";
import { listApplicationsPage } from "@/modules/applications/applications.service";
import { listCategories } from "@/modules/jobs/jobs.service";
import { parsePage } from "@/lib/utils/pagination";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/formatDate";

export default async function AdminQueriesPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const tab = params.tab === "applications" ? "applications" : "contacts";
  const query = params.q;
  const pageNumber = parsePage(params.page);
  const [contacts, applications] = await Promise.all([
    tab === "contacts" ? listContactMessagesPage({ q: query, page: pageNumber, pageSize: 10 }) : Promise.resolve(null),
    tab === "applications" ? listApplicationsPage({ q: query, page: pageNumber, pageSize: 10 }) : Promise.resolve(null),
  ]);
  const page = contacts ?? applications;
  return (
    <>
      <PageTitle title="Query Tab" subtitle="Review contact submissions and application-related queries." />
      <div className="mb-5 flex flex-wrap gap-2">
        <Link href={`/admin/queries?tab=contacts${query ? `&q=${encodeURIComponent(query)}` : ""}`} className={cn("rounded-full border px-4 py-2 text-sm", tab === "contacts" ? "border-primary bg-primary text-white" : "border-line bg-white")}>Contact queries</Link>
        <Link href={`/admin/queries?tab=applications${query ? `&q=${encodeURIComponent(query)}` : ""}`} className={cn("rounded-full border px-4 py-2 text-sm", tab === "applications" ? "border-primary bg-primary text-white" : "border-line bg-white")}>Application queries</Link>
      </div>
      <form method="GET" className="mb-5 flex gap-3 rounded-lg border border-line bg-white p-4">
        <input type="hidden" name="tab" value={tab} />
        <input name="q" defaultValue={query} placeholder={tab === "contacts" ? "Search name, email, job title..." : "Search candidate or job..."} className={`${inputClass} flex-1`} />
        <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white">Search</button>
      </form>
      {tab === "applications" && applications ? <><ApplicantsTable applications={applications.items} /><Pagination page={applications} pathname="/admin/queries" searchParams={{ tab, q: query }} /></> : contacts ? <><ContactTable items={contacts.items} /><Pagination page={contacts} pathname="/admin/queries" searchParams={{ tab, q: query }} /></> : null}
    </>
  );
}

function ContactTable({ items }: { items: { id: string; name: string; email: string; jobTitle: string; message: string; createdAt: string }[] }) {
  if (!items.length) return <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center text-muted">No contact queries found.</div>;
  return <div className="overflow-x-auto rounded-lg border border-line bg-white"><table className="w-full text-left text-sm"><thead className="bg-surface text-muted"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Job title</th><th className="px-4 py-3">Message</th><th className="px-4 py-3">Received</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-line"><td className="px-4 py-3"><p className="font-medium">{item.name}</p><p className="text-xs text-muted">{item.email}</p></td><td className="px-4 py-3">{item.jobTitle}</td><td className="max-w-md px-4 py-3 text-muted">{item.message}</td><td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(item.createdAt)}</td></tr>)}</tbody></table></div>;
}
