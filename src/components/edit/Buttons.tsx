import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

export function IconButton({
  className,
  children,
  variant = "ghost",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}) {
  const sizes: Record<Size, string> = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };
  const variants: Record<Variant, string> = {
    primary:
      "gradient-primary text-white shadow-[0_10px_30px_-10px_rgba(124,58,237,0.6)]",
    ghost: "bg-white/[0.04] text-muted-foreground hover:text-foreground",
    outline: "border border-white/[0.08] text-muted-foreground hover:text-foreground",
    danger: "bg-[#ef4444]/10 text-[#fca5a5]",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition-all active:scale-95",
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ActionButton({
  className,
  children,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}) {
  const variants: Record<Variant, string> = {
    primary:
      "gradient-primary text-white shadow-[0_10px_30px_-10px_rgba(124,58,237,0.6)]",
    ghost: "bg-white/[0.04] text-foreground hover:bg-white/[0.06]",
    outline: "border border-white/[0.1] text-foreground hover:bg-white/[0.03]",
    danger: "bg-[#ef4444]/12 text-[#fca5a5] hover:bg-[#ef4444]/20",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-medium tracking-tight transition-all active:scale-[0.97]",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
