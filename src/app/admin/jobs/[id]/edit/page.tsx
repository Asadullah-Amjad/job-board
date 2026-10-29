import { notFound } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import JobForm from "@/components/admin/JobForm";
import { requireAdmin } from "@/lib/auth/session";
import { getJobById, listCategories } from "@/modules/jobs/jobs.service";
import { listCompanies } from "@/modules/companies/companies.service";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [job, categories, companies] = await Promise.all([getJobById(id), listCategories(), listCompanies()]);
  if (!job) notFound();
  return (
    <>
      <PageTitle title={`Edit: ${job.title}`} />
      <JobForm job={job} categories={categories} companies={companies} />
    </>
  );
}
