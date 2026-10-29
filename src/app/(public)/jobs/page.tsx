import type { Metadata } from "next";
import JobsBrowser from "@/components/jobs/JobsBrowser";
import { listCategories } from "@/modules/jobs/jobs.service";

export const metadata: Metadata = { title: "Browse Jobs" };

export default async function JobsPage() {
  const categories = await listCategories();
  return <JobsBrowser categories={categories} />;
}
