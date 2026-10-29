"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/api.types";
import { str } from "@/lib/utils/form";
import { requireUser } from "@/lib/auth/session";
import { updateProfile } from "@/modules/auth/auth.service";
import { publicMessage } from "@/lib/errors";

export async function updateProfileAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = str(fd, "name");
  if (name.length < 2) return { error: "Please enter your full name." };
  try {
    await updateProfile(user.id, {
      name,
      phone: str(fd, "phone").slice(0, 30),
      city: str(fd, "city").slice(0, 60),
      skills: str(fd, "skills").slice(0, 300),
      bio: str(fd, "bio").slice(0, 1000),
    });
  } catch (error) {
    return { error: publicMessage(error, "Your profile could not be saved. Please try again."), code: "INTERNAL_ERROR" };
  }
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/profile");
  return { success: "Profile saved." };
}
