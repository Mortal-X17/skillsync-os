import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      className={cn(
        "card-surface p-5 shadow-[var(--shadow-elegant)] transition-all duration-300 active:scale-[0.985]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between px-1", className)}>
      <h2 className="text-[15px] font-medium tracking-tight text-foreground">
        {title}
      </h2>
      {action ? (
        <span className="text-[12px] font-medium text-muted-foreground">
          {action}
        </span>
      ) : null}
    </div>
  );
}

export function Skeleton({
  className,
}: {
  className?: string;
}) {
  return <div className={cn("skeleton", className)} />;
}

export function Chip({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-white/[0.04] text-muted-foreground border-white/[0.06]",
    primary: "bg-[#7c3aed]/12 text-[#c4b5fd] border-[#7c3aed]/25",
    success: "bg-[#22c55e]/10 text-[#86efac] border-[#22c55e]/20",
    warning: "bg-[#f59e0b]/10 text-[#fcd34d] border-[#f59e0b]/20",
    danger: "bg-[#ef4444]/10 text-[#fca5a5] border-[#ef4444]/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  className,
  tone = "primary",
}: {
  value: number;
  className?: string;
  tone?: "primary" | "muted" | "gradient";
}) {
  const fill =
    tone === "gradient"
      ? "gradient-primary"
      : tone === "muted"
        ? "bg-white/40"
        : "bg-[#7c3aed]";
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          fill,
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
