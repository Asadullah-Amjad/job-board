"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/api.types";
import { requireAdmin } from "@/lib/auth/session";
import { publicMessage } from "@/lib/errors";
import { str } from "@/lib/utils/form";
import { createCompany, deleteCompany, updateCompany } from "@/modules/companies/companies.service";

function refreshCompanies() {
  revalidatePath("/admin/companies");
  revalidatePath("/companies");
  revalidatePath("/admin/jobs");
  revalidatePath("/", "layout");
}

export async function createCompanyAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const result = await createCompany(str(fd, "name"));
    if (!result.ok) return { error: result.reason === "duplicate" ? "This company already exists." : "Company name is too short." };
    refreshCompanies();
    return { success: "Company added." };
  } catch (error) {
    return { error: publicMessage(error, "The company could not be added. Please try again."), code: "INTERNAL_ERROR" };
  }
}

export async function updateCompanyAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const result = await updateCompany(str(fd, "id"), str(fd, "name"));
    if (!result.ok) {
      if (result.reason === "duplicate") return { error: "This company already exists." };
      if (result.reason === "short") return { error: "Company name is too short." };
      return { error: "Company was not found." };
    }
    refreshCompanies();
    return { success: "Company updated." };
  } catch (error) {
    return { error: publicMessage(error, "The company could not be updated. Please try again."), code: "INTERNAL_ERROR" };
  }
}

export async function deleteCompanyAction(fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const result = await deleteCompany(str(fd, "id"));
    if (!result.ok) {
      if (result.reason === "has-jobs") return { error: "Company cannot be deleted while it has jobs." };
      return { error: "Company was not found." };
    }
    refreshCompanies();
    return { success: "Company deleted." };
  } catch (error) {
    return { error: publicMessage(error, "The company could not be deleted. Please try again."), code: "INTERNAL_ERROR" };
  }
}
