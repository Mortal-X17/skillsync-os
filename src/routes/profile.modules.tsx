import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/primitives";
import { useAppStore } from "@/store/useAppStore";

export const Route = createFileRoute("/profile/modules")({
  head: () => ({
    meta: [
      { title: "Modules — SkillSync" },
      { name: "description", content: "Enable optional modules like Attendance and Expenses." },
      { property: "og:title", content: "Modules — SkillSync" },
      { property: "og:description", content: "Turn optional modules on or off." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModulesPage,
});

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={
        "relative h-6 w-11 shrink-0 rounded-full transition-colors " +
        (on ? "bg-[#7c3aed]" : "bg-white/10")
      }
    >
      <span
        className={
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " +
          (on ? "translate-x-[22px]" : "translate-x-0.5")
        }
      />
    </button>
  );
}

function ModuleRow({
  icon: Icon,
  title,
  desc,
  on,
  onChange,
}: {
  icon: typeof GraduationCap;
  title: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Card className="flex items-start gap-3 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04]">
        <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[14px] font-semibold tracking-tight">{title}</div>
          <Toggle on={on} onChange={onChange} />
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
          {desc}
        </p>
      </div>
    </Card>
  );
}

function ModulesPage() {
  const modules = useAppStore((s) => s.preferences.modules);
  const setModuleEnabled = useAppStore((s) => s.setModuleEnabled);

  return (
    <AppShell>
      <header className="mb-4 flex items-center gap-3 px-5 pt-1">
        <Link
          to="/profile"
          className="glass flex h-10 w-10 items-center justify-center rounded-full active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.75} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Preferences
          </div>
          <h1 className="truncate text-[22px] font-semibold leading-tight tracking-[-0.02em]">
            Modules
          </h1>
        </div>
      </header>

      <div className="space-y-3 px-5 pb-24">
        <p className="px-1 text-[12.5px] text-muted-foreground">
          Optional workspaces. Turn on only what you need.
        </p>
        <ModuleRow
          icon={GraduationCap}
          title="College Attendance"
          desc="Track subjects, attendance percentage, and semester overview."
          on={modules.attendance}
          onChange={(v) => setModuleEnabled("attendance", v)}
        />
        <ModuleRow
          icon={Wallet}
          title="Expense Manager"
          desc="Log daily credits and debits with a monthly summary."
          on={modules.expenses}
          onChange={(v) => setModuleEnabled("expenses", v)}
        />
      </div>
    </AppShell>
  );
}
