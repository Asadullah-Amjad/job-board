import { cn } from "@/lib/utils/cn";

const tones = {
  blue: "border-blue-300 bg-blue-50 text-blue-700",
  green: "border-emerald-300 bg-emerald-50 text-emerald-700",
  violet: "border-violet-300 bg-violet-50 text-violet-700",
  amber: "border-amber-300 bg-amber-50 text-amber-700",
  red: "border-red-300 bg-red-50 text-red-700",
  gray: "border-slate-300 bg-slate-50 text-slate-600",
};

export function Badge({
  tone = "blue",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-block rounded border px-2 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
