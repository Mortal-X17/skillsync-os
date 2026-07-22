import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronRight,
  Cloud,
  Palette,
  Info,
  Bell,
  Shield,
  Trophy,
  Settings2,
  Sparkles,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Card, Chip, ProgressBar, SectionHeader, Skeleton } from "@/components/ui/primitives";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — SkillSync" },
      { name: "description", content: "Your level, achievements and preferences." },
      { property: "og:title", content: "Profile — SkillSync" },
      { property: "og:description", content: "Your growth, at a glance." },
    ],
  }),
  component: ProfilePage,
});

const settingsGroups: {
  title: string;
  items: { label: string; icon: typeof Cloud; hint?: string }[];
}[] = [
  {
    title: "Preferences",
    items: [
      { label: "Notifications", icon: Bell, hint: "On" },
      { label: "Theme", icon: Palette, hint: "Dark" },
      { label: "Privacy", icon: Shield },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Backup", icon: Cloud, hint: "—" },
      { label: "Advanced", icon: Settings2 },
      { label: "About SkillSync", icon: Info },
    ],
  },
];

function ProfilePage() {
  return (
    <AppShell>
      <PageHeader eyebrow="You" title="Profile." />

      <div className="space-y-6 px-5">
        {/* Identity card */}
        <Card className="relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#7c3aed]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[#2563eb]/20 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="skeleton h-16 w-16 rounded-full" />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full gradient-primary text-[10px] font-semibold text-white shadow-lg">
                —
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </div>

          <div className="relative mt-5 space-y-2">
            <div className="flex items-center justify-between text-[12px] text-muted-foreground">
              <span>Level progress</span>
              <span className="text-foreground/80">— / — XP</span>
            </div>
            <ProgressBar value={0} tone="gradient" />
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-3">
            {[
              { k: "Streak", v: "—" },
              { k: "Level", v: "—" },
              { k: "XP", v: "—" },
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

        {/* Achievements */}
        <section className="space-y-3">
          <SectionHeader
            title="Achievements"
            action={
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> See all
              </span>
            }
          />
          <Card>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                    <Trophy className="h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
                  </div>
                  <Skeleton className="h-2 w-10" />
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Settings */}
        {settingsGroups.map((group) => (
          <section key={group.title} className="space-y-3">
            <SectionHeader title={group.title} />
            <Card className="p-2">
              <div className="divide-y divide-white/[0.05]">
                {group.items.map(({ label, icon: Icon, hint }) => (
                  <button
                    key={label}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03]">
                      <Icon className="h-[16px] w-[16px] text-muted-foreground" strokeWidth={1.75} />
                    </span>
                    <span className="flex-1 text-[14px] font-medium">{label}</span>
                    {hint ? <Chip>{hint}</Chip> : null}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </button>
                ))}
              </div>
            </Card>
          </section>
        ))}

        <p className="pb-4 text-center text-[11px] text-muted-foreground">
          SkillSync · v0.1 · Personal Growth OS
        </p>
      </div>
    </AppShell>
  );
}
