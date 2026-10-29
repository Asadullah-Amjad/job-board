"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/api.types";
import { JOB_TYPES, type JobInput, type JobType } from "@/types/job.types";
import { str } from "@/lib/utils/form";
import { requireAdmin } from "@/lib/auth/session";
import {
  createCategory, createJob, deleteCategory, deleteJob, listCategories, updateCategory, updateJob,
} from "@/modules/jobs/jobs.service";
import { publicMessage } from "@/lib/errors";

export async function saveJobAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(fd, "id");
  const type = str(fd, "type") as JobType;
  const input: JobInput = {
    title: str(fd, "title"),
    company: str(fd, "company"),
    location: str(fd, "location"),
    type,
    salaryMin: Number(str(fd, "salaryMin")),
    salaryMax: Number(str(fd, "salaryMax")),
    categorySlug: str(fd, "categorySlug"),
    description: str(fd, "description"),
    requirements: str(fd, "requirements"),
    status: str(fd, "status") === "closed" ? "closed" : "open",
  };
  if (!input.title || !input.company || !input.location || !input.description)
    return { error: "Title, company, location and description are required." };
  if (!JOB_TYPES.includes(type)) return { error: "Please select a job type." };
  let categories;
  try {
    categories = await listCategories();
  } catch (error) {
    return { error: publicMessage(error, "Categories are temporarily unavailable. Please try again."), code: "INTERNAL_ERROR" };
  }
  if (!categories.some((c) => c.slug === input.categorySlug))
    return { error: "Please select a category." };
  if (!Number.isFinite(input.salaryMin) || !Number.isFinite(input.salaryMax) || input.salaryMin < 0 || input.salaryMax < input.salaryMin)
    return { error: "Enter a valid salary range (max must be at least min)." };

  try {
    if (id) await updateJob(id, input);
    else await createJob(input);
  } catch (error) {
    return { error: publicMessage(error, "The job could not be saved. Please try again."), code: "INTERNAL_ERROR" };
  }
  revalidatePath("/", "layout");
  redirect("/admin/jobs");
}

export async function deleteJobAction(fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return { error: "Job ID is required." };
  try {
    await deleteJob(id);
  } catch (error) {
    return { error: publicMessage(error, "The job could not be deleted. Please try again."), code: "INTERNAL_ERROR" };
  }
  revalidatePath("/", "layout");
  return { success: "Job and its applications deleted." };
}

export async function createCategoryAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = str(fd, "name");
  if (name.length < 2) return { error: "Category name is too short." };
  if (!(await createCategory(name))) return { error: "This category already exists." };
  revalidatePath("/", "layout");
  return { success: "Category added." };
}

export async function deleteCategoryAction(fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const slug = str(fd, "slug");
  if (!slug) return { error: "Category is required." };
  if (!(await deleteCategory(slug))) return { error: "Category could not be deleted because it has jobs." };
  revalidatePath("/", "layout");
  return { success: "Category deleted." };
}

export async function updateCategoryAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const slug = str(fd, "slug");
  const name = str(fd, "name");
  if (!slug) return { error: "Category is required." };
  try {
    const result = await updateCategory(slug, name);
    if (!result.ok) return { error: result.reason === "duplicate" ? "This category already exists." : "Category name is too short." };
    revalidatePath("/admin/categories");
    revalidatePath("/jobs");
    return { success: "Category updated." };
  } catch (error) {
    return { error: publicMessage(error, "The category could not be updated. Please try again."), code: "INTERNAL_ERROR" };
  }
}
