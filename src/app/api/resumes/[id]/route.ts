import { getCurrentUser } from "@/lib/auth/session";
import { getResume } from "@/modules/resumes/resumes.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const resume = await getResume(id);
  if (!resume) return new Response("Not found", { status: 404 });
  if (user.role !== "admin" && resume.userId !== user.id)
    return new Response("Forbidden", { status: 403 });
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("resumes")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (!row) return new Response("File missing", { status: 404 });

  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(row.storage_path, 60);
  if (error || !data) return new Response("File missing", { status: 404 });

  const fileResponse = await fetch(data.signedUrl);
  if (!fileResponse.ok) return new Response("File missing", { status: 404 });
  const headers = new Headers(fileResponse.headers);
  headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(resume.originalName)}"`);
  return new Response(fileResponse.body, { status: 200, headers });
}
