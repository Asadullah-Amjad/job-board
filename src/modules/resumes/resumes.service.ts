import path from "node:path";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AppError } from "@/lib/errors";
import type { Resume } from "@/types/db.types";

const ALLOWED: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MAX_RESUMES = 5;

function mapResume(row: Record<string, any>): Resume {
  return {
    id: row.id,
    userId: row.user_id,
    originalName: row.original_name,
    storedName: row.stored_name,
    size: row.size_bytes,
    mime: row.mime_type,
    createdAt: row.created_at,
  };
}

export async function listResumes(userId: string): Promise<Resume[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Resumes are temporarily unavailable. Please try again.", 500, { cause: error });
  return (data ?? []).map(mapResume);
}

export async function getResume(id: string): Promise<Resume | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("resumes").select("*").eq("id", id).maybeSingle();
  if (error) throw new AppError("DATABASE_UNAVAILABLE", "Resumes are temporarily unavailable. Please try again.", 500, { cause: error });
  return data ? mapResume(data) : null;
}

export async function saveResume(userId: string, file: File): Promise<{ error?: string }> {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED[ext]) return { error: "Only PDF, DOC or DOCX files are allowed." };
  if (file.size === 0) return { error: "Please choose a file." };
  if (file.size > MAX_RESUME_BYTES) return { error: "File is too large (max 5 MB)." };
  if ((await listResumes(userId)).length >= MAX_RESUMES)
    return { error: `You can keep up to ${MAX_RESUMES} resumes. Delete one first.` };

  const supabase = createSupabaseAdminClient();
  const storedName = `${crypto.randomUUID()}${ext}`;
  const storagePath = `${userId}/${storedName}`;
  const { error: uploadError } = await supabase.storage.from("resumes").upload(storagePath, file, {
    contentType: ALLOWED[ext],
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("resumes").insert({
    user_id: userId,
    original_name: path.basename(file.name),
    stored_name: storedName,
    storage_path: storagePath,
    size_bytes: file.size,
    mime_type: ALLOWED[ext],
  });
  if (insertError) {
    await supabase.storage.from("resumes").remove([storagePath]);
    return { error: insertError.message };
  }
  return {};
}

export async function deleteResume(id: string, userId: string) {
  const resume = await getResume(id);
  if (!resume || resume.userId !== userId) return false;
  const supabase = createSupabaseAdminClient();
  const { data: row } = await supabase.from("resumes").select("storage_path").eq("id", id).single();
  const { error: deleteMetadataError } = await supabase.from("resumes").delete().eq("id", id).eq("user_id", userId);
  if (deleteMetadataError) return false;
  if (row?.storage_path) await supabase.storage.from("resumes").remove([row.storage_path]);
  return true;
}
