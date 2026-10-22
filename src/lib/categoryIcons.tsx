import {
  Wrench, Car, Laptop, HardHat, ShieldCheck, Briefcase,
  HeartPulse, GraduationCap, Settings, MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

type Meta = { icon: LucideIcon; text: string; bg: string };

const map: Record<string, Meta> = {
  plumber: { icon: Wrench, text: "text-blue-600", bg: "bg-blue-50" },
  "car-driver": { icon: Car, text: "text-blue-700", bg: "bg-blue-50" },
  "computer-operator": { icon: Laptop, text: "text-blue-600", bg: "bg-blue-50" },
  electrician: { icon: HardHat, text: "text-orange-500", bg: "bg-orange-50" },
  "security-guard": { icon: ShieldCheck, text: "text-blue-600", bg: "bg-emerald-50" },
  "office-boy": { icon: Briefcase, text: "text-orange-500", bg: "bg-orange-50" },
  healthcare: { icon: HeartPulse, text: "text-emerald-600", bg: "bg-emerald-50" },
  teaching: { icon: GraduationCap, text: "text-violet-600", bg: "bg-violet-50" },
  technician: { icon: Settings, text: "text-blue-600", bg: "bg-blue-50" },
  others: { icon: MoreHorizontal, text: "text-slate-500", bg: "bg-slate-100" },
};

// Admin ki banayi nayi category ke liye "others" ka icon use hota hai
export function getCategoryMeta(slug: string): Meta {
  return map[slug] ?? map.others;
}
