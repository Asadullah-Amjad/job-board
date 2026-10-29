import PageTitle from "@/components/ui/PageTitle";
import CompanyForm from "@/components/admin/CompanyForm";
import CompanyList from "@/components/admin/CompanyList";
import { requireAdmin } from "@/lib/auth/session";
import { listCompanies } from "@/modules/companies/companies.service";

export default async function AdminCompaniesPage() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Companies" subtitle="Companies with jobs cannot be deleted." />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]"><CompanyForm /><CompanyList companies={await listCompanies()} /></div>
    </>
  );
}
