import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || "JobHive Admin";

if (!url || !secretKey || !email || !password) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, ADMIN_EMAIL, and ADMIN_PASSWORD.");
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing } = await supabase.auth.admin.listUsers();
const admin = existing?.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

if (admin) {
  const { error } = await supabase.auth.admin.updateUserById(admin.id, {
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error) throw error;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ name, email, role: "admin" })
    .eq("id", admin.id);
  if (profileError) throw profileError;

  console.log(`Updated confirmed admin: ${email}`);
  process.exit(0);
}

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name },
});
if (error) throw error;

const { error: profileError } = await supabase
  .from("profiles")
  .update({ name, email, role: "admin" })
  .eq("id", data.user.id);
if (profileError) throw profileError;

console.log(`Created confirmed admin: ${email}`);
