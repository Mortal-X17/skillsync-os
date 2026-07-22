import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ChevronRight,
  Cloud,
  Palette,
  Info,
  Bell,
  Shield,
  Settings2,
  Download,
  Upload,
  RotateCcw,
  BarChart3,
  Activity,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Card, Chip, ProgressBar, SectionHeader } from "@/components/ui/primitives";
import { BottomSheet, ConfirmDialog } from "@/components/edit/Sheet";
import { TextField } from "@/components/edit/Fields";
import { ActionButton } from "@/components/edit/Buttons";
import { useAppStore, useHydrated } from "@/store/useAppStore";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — SkillSync" },
      { name: "description", content: "Your level, preferences and backups." },
      { property: "og:title", content: "Profile — SkillSync" },
      { property: "og:description", content: "Your growth, at a glance." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const hydrated = useHydrated();
  const profile = useAppStore((s) => s.profile);
  const preferences = useAppStore((s) => s.preferences);
  const stats = useAppStore((s) => s.stats);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const exportJSON = useAppStore((s) => s.exportJSON);
  const importJSON = useAppStore((s) => s.importJSON);
  const resetAll = useAppStore((s) => s.resetAll);

  const [openProfile, setOpenProfile] = useState(false);
  const [openReset, setOpenReset] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials =
    (profile.name || "L")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "L";

  const handleExport = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillsync-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const result = importJSON(text);
    setImportMsg(result.ok ? "Import successful." : `Import failed: ${result.error}`);
    setTimeout(() => setImportMsg(null), 4000);
  };

  const xpToNext = stats.xp % 100;

  return (
    <AppShell>
      <PageHeader eyebrow="You" title="Profile." />

      <div className="space-y-6 px-5">
        {/* Identity */}
        <Card className="relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#7c3aed]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[#2563eb]/20 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-[20px] font-semibold text-white">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full gradient-primary text-[10px] font-semibold text-white shadow-lg">
                {hydrated ? stats.level : "—"}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[16px] font-semibold tracking-tight">
                {hydrated ? profile.name || "Learner" : "…"}
              </div>
              <button
                onClick={() => setOpenProfile(true)}
                className="text-[12px] text-muted-foreground underline-offset-2 hover:underline"
              >
                Edit profile
              </button>
            </div>
          </div>

          <div className="relative mt-5 space-y-2">
            <div className="flex items-center justify-between text-[12px] text-muted-foreground">
              <span>Level progress</span>
              <span className="text-foreground/80">
                {hydrated ? `${xpToNext} / 100 XP` : "— / — XP"}
              </span>
            </div>
            <ProgressBar value={hydrated ? xpToNext : 0} tone="gradient" />
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-3">
            {[
              { k: "Streak", v: hydrated ? String(stats.streak) : "—" },
              { k: "Level", v: hydrated ? String(stats.level) : "—" },
              { k: "XP", v: hydrated ? String(stats.xp) : "—" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3"
              >
                <div className="text-[11px] text-muted-foreground">{s.k}</div>
                <div className="mt-1 text-[18px] font-semibold tracking-tight">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Insights */}
        <section className="space-y-3">
          <SectionHeader title="Insights" />
          <Link
            to="/analytics"
            className="card-surface flex items-center gap-3 p-4 transition-all active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary">
              <BarChart3 className="h-5 w-5 text-white" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold tracking-tight">
                View analytics
              </div>
              <div className="text-[12px] text-muted-foreground">
                Learning, projects and habit trends
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          </Link>
          <Link
            to="/habits"
            className="card-surface flex items-center gap-3 p-4 transition-all active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04]">
              <Activity className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold tracking-tight">
                Operation Rebirth
              </div>
              <div className="text-[12px] text-muted-foreground">
                Daily habit tracking
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          </Link>
        </section>

        {/* Preferences */}
        <section className="space-y-3">
          <SectionHeader title="Preferences" />
          <Card className="p-2">
            <div className="divide-y divide-white/[0.05]">
              <SettingRow
                icon={Bell}
                label="Notifications"
                right={
                  <Toggle
                    on={preferences.notifications}
                    onChange={(v) => updatePreferences({ notifications: v })}
                  />
                }
              />
              <SettingRow icon={Palette} label="Theme" hint="Dark" />
              <SettingRow
                icon={Settings2}
                label="Developer mode"
                right={
                  <Toggle
                    on={preferences.developerMode}
                    onChange={(v) => updatePreferences({ developerMode: v })}
                  />
                }
              />
            </div>
          </Card>
        </section>

        {/* Backup */}
        <section className="space-y-3">
          <SectionHeader title="Backup" />
          <Card className="p-2">
            <div className="divide-y divide-white/[0.05]">
              <SettingButtonRow icon={Download} label="Export data" onClick={handleExport} />
              <SettingButtonRow
                icon={Upload}
                label="Import data"
                onClick={() => fileRef.current?.click()}
              />
              <SettingButtonRow
                icon={RotateCcw}
                label="Reset everything"
                onClick={() => setOpenReset(true)}
                danger
              />
            </div>
          </Card>
          {importMsg ? (
            <div className="text-center text-[12px] text-muted-foreground">
              {importMsg}
            </div>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = "";
            }}
          />
        </section>

        {/* System */}
        <section className="space-y-3">
          <SectionHeader title="System" />
          <Card className="p-2">
            <div className="divide-y divide-white/[0.05]">
              <SettingRow icon={Shield} label="Privacy" hint="Local-only" />
              <SettingRow icon={Cloud} label="Cloud sync" hint="Soon" />
              <SettingRow icon={Info} label="About SkillSync" hint="v0.2" />
            </div>
          </Card>
        </section>

        <p className="pb-4 text-center text-[11px] text-muted-foreground">
          SkillSync OS · Personal Growth Operating System
        </p>
      </div>

      <BottomSheet
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        title="Edit profile"
      >
        <div className="space-y-3">
          <label className="block text-[12px] text-muted-foreground">Name</label>
          <TextField
            autoFocus
            defaultValue={profile.name}
            onBlur={(e) => updateProfile({ name: e.target.value })}
          />
          <ActionButton className="w-full" onClick={() => setOpenProfile(false)}>
            Done
          </ActionButton>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={openReset}
        onClose={() => setOpenReset(false)}
        title="Reset all data?"
        description="Every roadmap, note, project, planner task and habit log will be wiped."
        confirmLabel="Reset"
        onConfirm={resetAll}
      />
    </AppShell>
  );
}

function SettingRow({
  icon: Icon,
  label,
  hint,
  right,
}: {
  icon: typeof Cloud;
  label: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03]">
        <Icon className="h-[16px] w-[16px] text-muted-foreground" strokeWidth={1.75} />
      </span>
      <span className="flex-1 text-[14px] font-medium">{label}</span>
      {right ?? (hint ? <Chip>{hint}</Chip> : null)}
    </div>
  );
}

function SettingButtonRow({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Cloud;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.02]"
    >
      <span
        className={
          "flex h-9 w-9 items-center justify-center rounded-xl " +
          (danger ? "bg-[#ef4444]/10 text-[#fca5a5]" : "bg-white/[0.03] text-muted-foreground")
        }
      >
        <Icon className="h-[16px] w-[16px]" strokeWidth={1.75} />
      </span>
      <span
        className={
          "flex-1 text-[14px] font-medium " + (danger ? "text-[#fca5a5]" : "")
        }
      >
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
    </button>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={
        "relative h-6 w-11 rounded-full transition-colors " +
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
