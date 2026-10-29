import PageTitle from "@/components/ui/PageTitle";
import JobForm from "@/components/admin/JobForm";
import { requireAdmin } from "@/lib/auth/session";
import { listCategories } from "@/modules/jobs/jobs.service";
import { listCompanies } from "@/modules/companies/companies.service";

export default async function NewJobPage() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Post new job" />
      <JobForm categories={await listCategories()} companies={await listCompanies()} />
    </>
  );
}
