import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getResume } from "@/modules/resumes/resumes.service";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const resume = getResume(id);
  if (!resume) return new Response("Not found", { status: 404 });
  if (user.role !== "admin" && resume.userId !== user.id)
    return new Response("Forbidden", { status: 403 });
  let file: Buffer;
  try {
    file = fs.readFileSync(path.join(UPLOAD_DIR, resume.storedName));
  } catch {
    return new Response("File missing", { status: 404 });
  }
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": resume.mime,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(resume.originalName)}"`,
    },
  });
}
