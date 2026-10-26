import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { User } from "@/types/db.types";

export async function findUserById(id: string): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,name,email,role,phone,city,skills,bio,created_at")
    .eq("id", id)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    phone: data.phone ?? undefined,
    city: data.city ?? undefined,
    skills: data.skills ?? undefined,
    bio: data.bio ?? undefined,
    createdAt: data.created_at,
  };
}

export async function updateProfile(
  id: string,
  data: { name: string; phone: string; city: string; skills: string; bio: string }
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("profiles").update(data).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addContactMessage(message: { name: string; email: string; message: string }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("contact_messages").insert(message);
  if (error) throw new Error(error.message);
}
