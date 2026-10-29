"use server";

import type { ActionState } from "@/types/api.types";
import { str } from "@/lib/utils/form";
import { addContactMessage } from "@/modules/auth/auth.service";
import { publicMessage } from "@/lib/errors";

export async function sendMessageAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const name = str(fd, "name");
  const email = str(fd, "email");
  const jobTitle = str(fd, "jobTitle");
  const message = str(fd, "message");
  if (!name || !jobTitle || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10)
    return { error: "Please fill in your name, email, job title, and a message of at least 10 characters." };
  try {
    await addContactMessage({ name: name.slice(0, 120), email, jobTitle: jobTitle.slice(0, 160), message: message.slice(0, 2000) });
  } catch (error) {
    return { error: publicMessage(error, "Your message could not be sent. Please try again."), code: "INTERNAL_ERROR" };
  }
  return { success: "Thanks! We received your message and will reply soon." };
}
