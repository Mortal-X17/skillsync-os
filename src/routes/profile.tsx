import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ChevronRight,
  Palette,
  Info,
  Bell,
  Shield,
  Settings2,
  BarChart3,
  Activity,
  Camera,
  Trash2,
  Code2,
  Database,
  FileJson,
  Sparkles,
  HardDrive,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { AppShell, AppFooter, PageHeader } from "@/components/layout/AppShell";
import { Card, Chip, ProgressBar, SectionHeader } from "@/components/ui/primitives";
import { BottomSheet } from "@/components/edit/Sheet";
import { TextField } from "@/components/edit/Fields";
import { ActionButton } from "@/components/edit/Buttons";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { BackupSection } from "@/components/profile/BackupSection";



export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — SkillSync" },
      { name: "description", content: "Your level, preferences and backups." },
      { property: "og:title", content: "Profile — SkillSync" },
      { property: "og:description", content: "Your growth, at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

const APP_VERSION = "0.3";

async function fileToResizedDataUrl(
  file: File,
  max = 256,
): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.88);
  } finally {
    URL.revokeObjectURL(url);
  }
}

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
  const [openJson, setOpenJson] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // Friction dialogs
  const [openDevVerify, setOpenDevVerify] = useState(false);
  const [devNameInput, setDevNameInput] = useState("");
  // Reset flow: 'demo' or 'all'; step1 = confirm intent, step2 = type-to-confirm
  const [resetMode, setResetMode] = useState<null | "demo" | "all">(null);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [resetPhraseInput, setResetPhraseInput] = useState("");


  const initials =
    (profile.name || "L")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "L";

  // export/import handled by BackupSection now


  const handleAvatarPick = async (file: File) => {
    try {
      const dataUrl = await fileToResizedDataUrl(file, 256);
      updateProfile({ avatar: dataUrl });
    } catch {
      setImportMsg("Couldn't read that image.");
      setTimeout(() => setImportMsg(null), 3000);
    }
  };

  const handleDevToggle = (v: boolean) => {
    if (!v) {
      updatePreferences({ developerMode: false });
      toast("Developer mode disabled");
      return;
    }
    setDevNameInput("");
    setOpenDevVerify(true);
  };

  const submitDevVerify = () => {
    const expected = (profile.name || "").trim().toLowerCase();
    const got = devNameInput.trim().toLowerCase();
    setOpenDevVerify(false);
    if (expected && got === expected) {
      updatePreferences({ developerMode: true });
      toast.success("Developer mode enabled");
    } else {
      toast.error("Entered name doesn't match. Developer mode was not enabled.");
    }
    setDevNameInput("");
  };

  const beginReset = (mode: "demo" | "all") => {
    setResetMode(mode);
    setResetPhraseInput("");
    setResetStep(1);
  };

  const closeReset = () => {
    setResetStep(0);
    setResetMode(null);
    setResetPhraseInput("");
  };

  const resetPhrase = resetMode === "all" ? "wipe everything" : "reset demo";

  const submitResetPhrase = () => {
    const ok = resetPhraseInput.trim().toLowerCase() === resetPhrase;
    const mode = resetMode;
    closeReset();
    if (ok) {
      resetAll();
      toast.success(
        mode === "all" ? "All data wiped. Fresh start." : "Reset to starter demo data.",
      );
    } else {
      toast.error("The entered text was wrong. No data was wiped.");
    }
  };


  const storageSize = useMemo(() => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = window.localStorage.getItem("skillsync:data:v1") ?? "";
      return new Blob([raw]).size;
    } catch {
      return 0;
    }
  }, [hydrated, profile, preferences, stats]);

  const jsonPreview = useMemo(
    () => (openJson ? exportJSON() : ""),
    [openJson, exportJSON],
  );

  const xpToNext = stats.xp % 100;

  return (
    <AppShell>
      <PageHeader eyebrow="You" title="Profile." />

      <div className="space-y-6 px-5">
        {/* Identity */}
        <Card className="relative overflow-hidden p-5">
          <div className="relative flex items-center gap-4">
            <button
              onClick={() => avatarFileRef.current?.click()}
              className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/[0.04] text-[20px] font-semibold text-white ring-1 ring-white/[0.08] transition-transform active:scale-95"
              aria-label="Change profile picture"
            >
              {hydrated && profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#2563eb]"
                >
                  {initials}
                </span>
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-[16px] font-semibold tracking-tight">
                  {hydrated ? profile.name || "Learner" : "…"}
                </div>
                <Chip tone="primary">Lv {hydrated ? stats.level : "—"}</Chip>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                <button
                  onClick={() => setOpenProfile(true)}
                  className="underline-offset-2 hover:underline"
                >
                  Edit name
                </button>
                <span className="text-white/10">·</span>
                <button
                  onClick={() => avatarFileRef.current?.click()}
                  className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                >
                  <Camera className="h-3 w-3" /> Change photo
                </button>
                {hydrated && profile.avatar ? (
                  <>
                    <span className="text-white/10">·</span>
                    <button
                      onClick={() => updateProfile({ avatar: "" })}
                      className="text-[#fca5a5] underline-offset-2 hover:underline"
                    >
                      Remove
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <input
            ref={avatarFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleAvatarPick(f);
              e.target.value = "";
            }}
          />

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
            </div>
          </Card>

          {/* Developer mode explainer */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.03]">
                <Code2 className="h-[16px] w-[16px] text-muted-foreground" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[14px] font-semibold tracking-tight">
                    Developer mode
                  </div>
                  <Toggle
                    on={preferences.developerMode}
                    onChange={handleDevToggle}
                  />

                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                  Unlocks tools built for power-users and testing.
                </p>
                <ul className="mt-3 space-y-1.5 text-[12.5px] text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-white/30" />
                    Raw JSON data viewer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-white/30" />
                    Storage size & diagnostics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-white/30" />
                    Reset to demo (seed) data
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-white/30" />
                    Roadmap import helpers &amp; experimental features
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {preferences.developerMode ? (
            <Card className="p-2">
              <div className="px-3 pb-1 pt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                Developer tools
              </div>
              <div className="divide-y divide-white/[0.05]">
                <SettingRow
                  icon={HardDrive}
                  label="Storage size"
                  hint={hydrated ? formatBytes(storageSize) : "—"}
                />
                <SettingButtonRow
                  icon={FileJson}
                  label="View raw JSON"
                  onClick={() => setOpenJson(true)}
                />
                <SettingButtonRow
                  icon={Database}
                  label="Reset to demo data"
                  onClick={() => beginReset("demo")}
                  danger

                />
              </div>
            </Card>
          ) : null}
        </section>

        <BackupSection onRequestReset={() => beginReset("all")} />


        {/* About */}
        <section className="space-y-3">
          <SectionHeader title="About" />
          <Card className="relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#7c3aed]/15 blur-3xl" />
            <div className="relative flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold tracking-tight">
                  SkillSync OS
                </div>
                <div className="text-[12.5px] text-muted-foreground">
                  Your personal growth operating system.
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Chip>v{APP_VERSION}</Chip>
                  <Chip>
                    <Shield className="h-3 w-3" /> Local-first
                  </Chip>
                  <Chip>Offline</Chip>
                  <Chip>Private</Chip>
                </div>
              </div>
            </div>
            <div className="relative mt-4 grid grid-cols-2 gap-2 text-[12px]">
              <AboutStat icon={Info} label="Build" value={`v${APP_VERSION}`} />
              <AboutStat
                icon={HardDrive}
                label="Storage"
                value={hydrated ? formatBytes(storageSize) : "—"}
              />
            </div>
            <p className="relative mt-4 text-[11.5px] leading-relaxed text-muted-foreground">
              Built for daily use. No accounts, no tracking, no cloud — every
              roadmap, note and habit stays on your device.
            </p>
          </Card>
        </section>

        <p className="pb-4 text-center text-[11px] text-muted-foreground">
          SkillSync · Made for the long game.
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

      <BottomSheet
        open={openJson}
        onClose={() => setOpenJson(false)}
        title="Raw data"
        className="max-h-[92dvh]"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <span>{formatBytes(storageSize)} in localStorage</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(jsonPreview).catch(() => {});
              }}
              className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-[11.5px] font-medium text-foreground active:scale-95"
            >
              Copy
            </button>
          </div>
          <pre className="max-h-[65dvh] overflow-auto rounded-xl border border-white/[0.06] bg-black/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            {jsonPreview}
          </pre>
        </div>
      </BottomSheet>

      {/* Developer mode verification */}
      <BottomSheet
        open={openDevVerify}
        onClose={() => setOpenDevVerify(false)}
        title="Unlock developer mode"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#7c3aed]/15 text-[#c4b5fd]">
              <Lock className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              Developer mode unlocks raw data access and destructive reset
              tools. Type your profile name to confirm it's really you.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[12px] text-muted-foreground">
              Your profile name
            </label>
            <TextField
              autoFocus
              placeholder={profile.name || "Your name"}
              value={devNameInput}
              onChange={(e) => setDevNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitDevVerify();
              }}
            />
          </div>
          <ActionButton className="w-full" onClick={submitDevVerify}>
            Unlock
          </ActionButton>
        </div>
      </BottomSheet>

      {/* Reset — step 1: intent */}
      <BottomSheet
        open={resetStep === 1}
        onClose={closeReset}
        title={resetMode === "all" ? "Wipe everything?" : "Reset to demo data?"}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/[0.06] p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ef4444]/15 text-[#fca5a5]">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              {resetMode === "all"
                ? "This will permanently erase every roadmap, note, project, planner task, habit log and profile change on this device."
                : "Your current data will be replaced with the starter demo content. This cannot be undone."}
            </p>
          </div>
          <p className="text-[12.5px] text-muted-foreground">
            You'll be asked to type a confirmation phrase on the next step.
          </p>
          <div className="flex gap-2">
            <button
              onClick={closeReset}
              className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-[13.5px] font-medium text-foreground active:scale-[0.97]"
            >
              No, cancel
            </button>
            <button
              onClick={() => setResetStep(2)}
              className="flex-1 rounded-xl bg-[#ef4444] py-2.5 text-[13.5px] font-medium text-white active:scale-[0.97]"
            >
              Yes, continue
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Reset — step 2: type to confirm */}
      <BottomSheet
        open={resetStep === 2}
        onClose={closeReset}
        title={resetMode === "all" ? "Confirm wipe" : "Confirm reset"}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/[0.06] p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ef4444]/15 text-[#fca5a5]">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              This action is permanent. To proceed, type the phrase below
              exactly and press Confirm.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[12px] text-muted-foreground">
              Type <span className="font-mono text-foreground">{resetPhrase}</span>
            </label>
            <TextField
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder={resetPhrase}
              value={resetPhraseInput}
              onChange={(e) => setResetPhraseInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitResetPhrase();
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={closeReset}
              className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-[13.5px] font-medium text-foreground active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              onClick={submitResetPhrase}
              className="flex-1 rounded-xl bg-[#ef4444] py-2.5 text-[13.5px] font-medium text-white active:scale-[0.97]"
            >
              Confirm
            </button>
          </div>
        </div>
      </BottomSheet>

      <AppFooter />
    </AppShell>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function AboutStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Info;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-[12.5px] font-medium">{value}</div>
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  hint,
  right,
}: {
  icon: typeof Info;
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
  icon: typeof Info;
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
      {danger ? (
        <Trash2 className="h-4 w-4 text-[#fca5a5]/70" />
      ) : (
        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
      )}
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
