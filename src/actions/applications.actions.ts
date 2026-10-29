"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/api.types";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/types/db.types";
import { str } from "@/lib/utils/form";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { createApplication, setApplicationStatus } from "@/modules/applications/applications.service";
import { publicMessage } from "@/lib/errors";

export async function applyAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.role !== "user") return { error: "Only users can apply for jobs." };
  let res;
  try {
    res = await createApplication({
      userId: user.id,
      jobId: str(fd, "jobId"),
      resumeId: str(fd, "resumeId"),
      note: str(fd, "note").slice(0, 1000),
    });
  } catch (error) {
    return { error: publicMessage(error, "Your application could not be submitted. Please try again."), code: "INTERNAL_ERROR" };
  }
  if (res.error) return { error: res.error };
  revalidatePath("/", "layout");
  return { success: "Application submitted. Good luck!" };
}

export async function updateApplicationStatusAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const status = str(fd, "status") as ApplicationStatus;
  if (!APPLICATION_STATUSES.includes(status)) return { error: "Invalid status." };
  try {
    await setApplicationStatus(str(fd, "id"), status);
  } catch (error) {
    return { error: publicMessage(error, "The application status could not be updated. Please try again."), code: "INTERNAL_ERROR" };
  }
  revalidatePath("/", "layout");
  return { success: "Status updated." };
}
