import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  hint,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  hint?: string;
  icon?: typeof Inbox;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04]">
        <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <div className="text-[14px] font-medium text-foreground">{title}</div>
        {hint ? (
          <div className="text-[12px] text-muted-foreground">{hint}</div>
        ) : null}
      </div>
      {action}
    </div>
  );
}
