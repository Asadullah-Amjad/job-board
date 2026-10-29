import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function ContactShortcut() {
  return (
    <Link
      href="/contact"
      aria-label="Contact JobHive"
      title="Contact JobHive"
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary-dark hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/30"
    >
      <MessageCircle size={25} aria-hidden="true" />
    </Link>
  );
}
