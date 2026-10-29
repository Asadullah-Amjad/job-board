import { getCurrentUser } from "@/lib/auth/session";
import { getResume } from "@/modules/resumes/resumes.service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/errors";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await getCurrentUser();
    if (!user) return Response.json({ success: false, data: null, error: "Please sign in to continue.", code: "UNAUTHENTICATED" }, { status: 401 });
    const resume = await getResume(id);
    if (!resume) return Response.json({ success: false, data: null, error: "Resume not found.", code: "NOT_FOUND" }, { status: 404 });
    if (user.role !== "admin" && resume.userId !== user.id)
      return Response.json({ success: false, data: null, error: "You do not have permission to access this resume.", code: "FORBIDDEN" }, { status: 403 });
    const supabase = createSupabaseAdminClient();
    const { data: row } = await supabase
    .from("resumes")
    .select("storage_path")
    .eq("id", id)
    .single();
    if (!row) return Response.json({ success: false, data: null, error: "Resume file not found.", code: "NOT_FOUND" }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(row.storage_path, 60);
    if (error || !data) return Response.json({ success: false, data: null, error: "Resume file not found.", code: "NOT_FOUND" }, { status: 404 });

  const fileResponse = await fetch(data.signedUrl);
    if (!fileResponse.ok) return Response.json({ success: false, data: null, error: "Resume file not found.", code: "NOT_FOUND" }, { status: 404 });
    const headers = new Headers(fileResponse.headers);
    const inline = resume.mime === "application/pdf" || resume.mime.startsWith("image/");
    headers.set("Content-Disposition", `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(resume.originalName)}"`);
    return new Response(fileResponse.body, { status: 200, headers });
  } catch (error) {
    return apiError(error, "The resume could not be downloaded. Please try again.");
  }
}
