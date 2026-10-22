import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { updateProfileAction } from "@/actions/profile.actions";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "My profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <>
      <PageTitle title="My profile" subtitle="Employers see this information when you apply." />
      <ActionForm action={updateProfileAction} submitLabel="Save profile" fullWidth={false} className="max-w-2xl rounded-lg border border-line bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><input name="name" required defaultValue={user.name} className={inputClass} /></Field>
          <Field label="Email"><input value={user.email} disabled className={`${inputClass} bg-slate-50 text-muted`} readOnly /></Field>
          <Field label="Phone"><input name="phone" defaultValue={user.phone} placeholder="+92 300 1234567" className={inputClass} /></Field>
          <Field label="City"><input name="city" defaultValue={user.city} placeholder="Lahore" className={inputClass} /></Field>
        </div>
        <Field label="Skills" hint="Separate with commas, e.g. plumbing, pipe fitting, welding">
          <input name="skills" defaultValue={user.skills} className={inputClass} />
        </Field>
        <Field label="About you"><textarea name="bio" rows={4} defaultValue={user.bio} className={inputClass} /></Field>
      </ActionForm>
    </>
  );
}
