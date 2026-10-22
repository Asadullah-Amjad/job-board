import fs from "node:fs";
import path from "node:path";
import { readDb, updateDb, uid, UPLOAD_DIR } from "@/lib/db";
import type { Resume } from "@/types/db.types";

const ALLOWED: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MAX_RESUMES = 5;

export const listResumes = (userId: string) =>
  readDb().resumes.filter((r) => r.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const getResume = (id: string) => readDb().resumes.find((r) => r.id === id) ?? null;

export async function saveResume(userId: string, file: File): Promise<{ error?: string }> {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED[ext]) return { error: "Only PDF, DOC or DOCX files are allowed." };
  if (file.size === 0) return { error: "Please choose a file." };
  if (file.size > MAX_RESUME_BYTES) return { error: "File is too large (max 5 MB)." };
  if (listResumes(userId).length >= MAX_RESUMES)
    return { error: `You can keep up to ${MAX_RESUMES} resumes. Delete one first.` };

  const id = uid();
  const storedName = `${id}${ext}`;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, storedName), Buffer.from(await file.arrayBuffer()));

  const resume: Resume = {
    id, userId, storedName,
    originalName: path.basename(file.name),
    size: file.size,
    mime: ALLOWED[ext],
    createdAt: new Date().toISOString(),
  };
  updateDb((db) => void db.resumes.push(resume));
  return {};
}

export function deleteResume(id: string, userId: string) {
  const r = getResume(id);
  if (!r || r.userId !== userId) return false;
  fs.rmSync(path.join(UPLOAD_DIR, r.storedName), { force: true });
  updateDb((db) => {
    db.resumes = db.resumes.filter((x) => x.id !== id);
  });
  return true;
}
