import { createFileRoute } from "@tanstack/react-router";
import {
  Flame,
  Sparkles,
  Zap,
  ArrowUpRight,
  BookOpen,
  FolderKanban,
  StickyNote,
  CalendarClock,
  Plus,
  Search,
  Bell,
  Target,
  ChevronRight,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import {
  Card,
  Chip,
  ProgressBar,
  SectionHeader,
  Skeleton,
} from "@/components/ui/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkillSync" },
      {
        name: "description",
        content: "Your personal growth dashboard: streaks, XP, focus and progress.",
      },
      { property: "og:title", content: "Dashboard — SkillSync" },
      {
        property: "og:description",
        content: "Your personal growth dashboard at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Wednesday · Jul 22"
        title="Good evening."
        subtitle="Let's keep the streak alive."
        right={
          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              className="glass flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95"
            >
              <Search className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.75} />
            </button>
            <button
              aria-label="Notifications"
              className="glass relative flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95"
            >
              <Bell className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.75} />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
            </button>
          </div>
        }
      />

      <div className="space-y-6 px-5">
        {/* Stat row */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Flame className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Daily Streak</span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[32px] font-semibold tracking-tight">—</span>
              <span className="text-[13px] text-muted-foreground">days</span>
            </div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full bg-white/[0.06]"
                />
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Zap className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Total XP</span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[32px] font-semibold tracking-tight">—</span>
              <span className="text-[13px] text-muted-foreground">xp</span>
            </div>
            <div className="mt-3">
              <Chip tone="primary">
                <Sparkles className="h-3 w-3" /> Level —
              </Chip>
            </div>
          </Card>
        </div>

        {/* Level card */}
        <Card className="relative overflow-hidden border-white/[0.08] p-5">
          <div className="pointer-events-none absolute inset-0 gradient-mesh opacity-70" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#7c3aed]/25 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Current Level
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[40px] font-semibold tracking-tight">
                    —
                  </span>
                  <span className="text-[14px] text-muted-foreground">
                    Ascending
                  </span>
                </div>
              </div>
              <div className="glass flex h-11 w-11 items-center justify-center rounded-full">
                <Target className="h-4 w-4 text-foreground" strokeWidth={1.75} />
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[12px] text-muted-foreground">
                <span>Progress to next level</span>
                <span>— / —</span>
              </div>
              <ProgressBar value={0} tone="gradient" />
            </div>
          </div>
        </Card>

        {/* Today's Focus */}
        <section className="space-y-3">
          <SectionHeader
            title="Today's Focus"
            action={<ArrowUpRight className="h-3.5 w-3.5" />}
          />
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-2.5 w-1/3" />
              </div>
              <div className="glass flex h-8 items-center rounded-full px-3 text-[11px] font-medium text-muted-foreground">
                Focus
              </div>
            </div>
          </Card>
        </section>

        {/* Quick Access */}
        <section className="space-y-3">
          <SectionHeader title="Quick Access" />
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { icon: BookOpen, label: "Learn" },
              { icon: FolderKanban, label: "Projects" },
              { icon: StickyNote, label: "Notes" },
              { icon: CalendarClock, label: "Plan" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="card-surface flex flex-col items-center gap-2 p-3 transition-all active:scale-[0.96]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04]">
                  <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Learning Progress */}
        <section className="space-y-3">
          <SectionHeader title="Learning Progress" action="See all" />
          <Card>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-1.5 w-full" />
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Projects */}
        <section className="space-y-3">
          <SectionHeader title="Projects" action="See all" />
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className="min-w-[220px] max-w-[240px] flex-1 space-y-3"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-full" />
                <Skeleton className="h-2.5 w-2/3" />
                <div className="pt-1">
                  <Skeleton className="h-1.5 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Notes */}
        <section className="space-y-3">
          <SectionHeader title="Recent Notes" action="Open" />
          <Card>
            <div className="divide-y divide-white/[0.05]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="skeleton h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-2.5 w-2/3" />
                    <Skeleton className="h-2 w-1/3" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Upcoming Tasks */}
        <section className="space-y-3">
          <SectionHeader title="Upcoming Tasks" />
          <Card>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border border-white/15" />
                  <Skeleton className="h-2.5 flex-1" />
                  <Skeleton className="h-2 w-10" />
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Operation Rebirth */}
        <section className="space-y-3">
          <SectionHeader title="Operation Rebirth" action="Details" />
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2563eb]/20 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-medium">Phase — of —</div>
                <Chip tone="primary">In progress</Chip>
              </div>
              <ProgressBar value={0} tone="gradient" />
              <div className="grid grid-cols-3 gap-3 pt-1">
                {["Discipline", "Skill", "Body"].map((k) => (
                  <div key={k} className="space-y-1.5">
                    <div className="text-[11px] text-muted-foreground">{k}</div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <div className="h-4" />

        {/* Floating quick add */}
        <button
          aria-label="Quick add"
          className="fixed bottom-28 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full gradient-primary shadow-[0_10px_40px_-10px_rgba(124,58,237,0.6)] transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5 text-white" strokeWidth={2.25} />
        </button>
      </div>
    </AppShell>
  );
}
