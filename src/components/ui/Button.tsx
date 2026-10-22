import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "outline" | "danger" | "ghost";

// Link ke liye bhi use karo: <Link className={buttonClasses("primary")}>
export function buttonClasses(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary" && "bg-primary text-white hover:bg-primary-dark",
    variant === "outline" && "border border-primary bg-white text-primary hover:bg-surface",
    variant === "danger" && "border border-red-200 bg-white text-red-600 hover:bg-red-50",
    variant === "ghost" && "text-muted hover:bg-surface hover:text-primary",
    className
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}
