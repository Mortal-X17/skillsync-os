import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-[6px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        className={cn(
          "animate-sheet-up glass relative mx-auto flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] bg-surface/90 shadow-[var(--shadow-float)]",
          className,
        )}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/15" />
        <div className="flex items-center justify-between gap-3 px-6 pt-3">
          <h3 className="min-w-0 truncate text-[17px] font-semibold tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="pressable flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-muted-foreground"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  destructive = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-[6px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="animate-dialog-pop glass relative w-full max-w-sm rounded-[24px] bg-surface/95 p-6 shadow-[var(--shadow-float)]">
        <h3 className="text-[17px] font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="pressable flex-1 rounded-[14px] border border-border-strong py-3 text-[14px] font-medium text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "pressable flex-1 rounded-[14px] py-3 text-[14px] font-medium text-primary-foreground",
              destructive
                ? "bg-danger shadow-[0_12px_30px_-14px_var(--danger)]"
                : "gradient-primary shadow-[var(--shadow-glow)]",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
