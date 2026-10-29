"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/api.types";
import { str } from "@/lib/utils/form";
import { requireUser } from "@/lib/auth/session";
import { deleteResume, saveResume } from "@/modules/resumes/resumes.service";
import { publicMessage } from "@/lib/errors";

export async function uploadResumeAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Please choose a file." };
  let res;
  try {
    res = await saveResume(user.id, file);
  } catch (error) {
    return { error: publicMessage(error, "The resume could not be uploaded. Please try again."), code: "INTERNAL_ERROR" };
  }
  if (res.error) return { error: res.error };
  revalidatePath("/dashboard", "layout");
  return { success: "Resume uploaded." };
}

export async function deleteResumeAction(fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(fd, "id");
  if (!id) return { error: "Resume ID is required." };
  try {
    if (!(await deleteResume(id, user.id))) return { error: "Resume could not be found.", code: "NOT_FOUND" };
  } catch (error) {
    return { error: publicMessage(error, "The resume could not be deleted. Please try again."), code: "INTERNAL_ERROR" };
  }
  revalidatePath("/dashboard", "layout");
  return { success: "Resume deleted." };
}
