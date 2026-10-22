import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import ActionForm from "@/components/ui/ActionForm";
import { Field, inputClass } from "@/components/ui/Field";
import { sendMessageAction } from "@/actions/contact.actions";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold text-navy">Contact us</h1>
        <p className="mt-2 text-muted">Questions about a job or your account? Send us a message.</p>
        <ul className="mt-6 space-y-4 text-sm">
          <li className="flex items-center gap-3"><Mail size={18} className="text-primary" /> info@jobhive.com</li>
          <li className="flex items-center gap-3"><Phone size={18} className="text-primary" /> +92 300 1234567</li>
          <li className="flex items-center gap-3"><MapPin size={18} className="text-primary" /> Lahore, Pakistan</li>
        </ul>
      </div>
      <ActionForm action={sendMessageAction} submitLabel="Send message" resetOnSuccess className="rounded-lg border border-line bg-white p-6">
        <Field label="Your name"><input name="name" required className={inputClass} /></Field>
        <Field label="Email"><input type="email" name="email" required className={inputClass} /></Field>
        <Field label="Message"><textarea name="message" rows={5} required minLength={10} className={inputClass} /></Field>
      </ActionForm>
    </div>
  );
}
