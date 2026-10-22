"use server";

import type { ActionState } from "@/types/api.types";
import { str } from "@/lib/utils/form";
import { addContactMessage } from "@/modules/auth/auth.service";

export async function sendMessageAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const name = str(fd, "name");
  const email = str(fd, "email");
  const message = str(fd, "message");
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10)
    return { error: "Please fill all fields (message at least 10 characters)." };
  addContactMessage({ name, email, message: message.slice(0, 2000) });
  return { success: "Thanks! We received your message and will reply soon." };
}
