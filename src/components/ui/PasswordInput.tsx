"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { inputClass } from "./Field";

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export default function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  return (
    <div className="relative">
      <input
        {...props}
        id={props.id ?? inputId}
        type={visible ? "text" : "password"}
        className={cn(inputClass, "pr-11", className)}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={props.id ?? inputId}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
