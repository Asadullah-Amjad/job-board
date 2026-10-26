"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/api.types";
import { str } from "@/lib/utils/form";
import { requireUser } from "@/lib/auth/session";
import { deleteResume, saveResume } from "@/modules/resumes/resumes.service";

export async function uploadResumeAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Please choose a file." };
  const res = await saveResume(user.id, file);
  if (res.error) return { error: res.error };
  revalidatePath("/dashboard", "layout");
  return { success: "Resume uploaded." };
}

export async function deleteResumeAction(fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(fd, "id");
  if (!id) return { error: "Resume ID is required." };
  if (!(await deleteResume(id, user.id))) return { error: "Resume could not be found." };
  revalidatePath("/dashboard", "layout");
  return { success: "Resume deleted." };
}
