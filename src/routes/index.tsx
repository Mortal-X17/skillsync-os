import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Flame,
  Sparkles,
  Zap,
  BookOpen,
  FolderKanban,
  StickyNote,
  CalendarClock,
  Plus,
  Target,
  ChevronRight,
  Activity,
  LineChart,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Card, Chip, ProgressBar, SectionHeader } from "@/components/ui/primitives";
import { EmptyState } from "@/components/common/EmptyState";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { roadmapPct } from "@/lib/progress";
import { todayISO } from "@/lib/date";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillSync — Personal Growth OS" },
      {
        name: "description",
        content:
          "Your personal growth operating system: roadmaps, projects, habits and daily focus in one place.",
      },
      { property: "og:title", content: "SkillSync — Personal Growth OS" },
      {
        property: "og:description",
        content: "Roadmaps, projects, habits, and daily focus in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Good night";
}

function todayDateLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function Dashboard() {
  const hydrated = useHydrated();
  const stats = useAppStore((s) => s.stats);
  const profile = useAppStore((s) => s.profile);
  const roadmaps = useAppStore((s) => s.roadmaps);
  const notes = useAppStore((s) => s.notes);
  const projects = useAppStore((s) => s.projects);
  const planner = useAppStore((s) => s.planner);
  const habits = useAppStore((s) => s.habits);
  const habitLogs = useAppStore((s) => s.habitLogs);

  const today = todayISO();
  const todaysTasks = useMemo(
    () => planner.filter((t) => t.date === today).slice(0, 3),
    [planner, today],
  );
  const recentNotes = useMemo(
    () => [...notes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3),
    [notes],
  );
  const activeProjects = useMemo(
    () => projects.filter((p) => p.status !== "done").slice(0, 4),
    [projects],
  );
  const todayHabitCount = habitLogs.filter((l) => l.date === today).length;
  const xpToNext = stats.xp % 100;

  return (
    <AppShell>
      <PageHeader
        eyebrow={todayDateLabel()}
        title={`${greeting()}${profile.name ? `, ${profile.name.split(" ")[0]}` : ""}.`}
        subtitle="Small steps, compounded daily."
        right={
          <Link
            to="/notes"
            aria-label="Notes"
            className="glass flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95"
          >
            <StickyNote className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.75} />
          </Link>
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
              <span className="text-[32px] font-semibold tracking-tight">
                {hydrated ? stats.streak : "—"}
              </span>
              <span className="text-[13px] text-muted-foreground">days</span>
            </div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const on = hydrated && i < Math.min(stats.streak, 7);
                return (
                  <div
                    key={i}
                    className={
                      "h-1.5 flex-1 rounded-full " +
                      (on ? "gradient-primary" : "bg-white/[0.06]")
                    }
                  />
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Zap className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Total XP</span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[32px] font-semibold tracking-tight">
                {hydrated ? stats.xp : "—"}
              </span>
              <span className="text-[13px] text-muted-foreground">xp</span>
            </div>
            <div className="mt-3">
              <Chip tone="primary">
                <Sparkles className="h-3 w-3" /> Level {hydrated ? stats.level : "—"}
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
                    {hydrated ? stats.level : "—"}
                  </span>
                  <span className="text-[14px] text-muted-foreground">Ascending</span>
                </div>
              </div>
              <div className="glass flex h-11 w-11 items-center justify-center rounded-full">
                <Target className="h-4 w-4 text-foreground" strokeWidth={1.75} />
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[12px] text-muted-foreground">
                <span>Progress to next level</span>
                <span>{hydrated ? `${xpToNext} / 100 xp` : "— / —"}</span>
              </div>
              <ProgressBar value={hydrated ? xpToNext : 0} tone="gradient" />
            </div>
          </div>
        </Card>

        {/* Quick Access */}
        <section className="space-y-3">
          <SectionHeader title="Quick Access" />
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { icon: BookOpen, label: "Learn", to: "/learn" as const },
              { icon: FolderKanban, label: "Projects", to: "/projects" as const },
              { icon: StickyNote, label: "Notes", to: "/notes" as const },
              { icon: Activity, label: "Habits", to: "/habits" as const },
            ].map(({ icon: Icon, label, to }) => (
              <Link
                key={label}
                to={to}
                className="card-surface flex flex-col items-center gap-2 p-3 transition-all active:scale-[0.96]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04]">
                  <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Today's Focus */}
        <section className="space-y-3">
          <SectionHeader
            title="Today's Focus"
            action={
              <Link to="/planner" className="inline-flex items-center gap-1">
                Open <ChevronRight className="h-3 w-3" />
              </Link>
            }
          />
          {!hydrated || todaysTasks.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="Nothing scheduled today"
              hint="Add a task in Planner to see it here."
            />
          ) : (
            <Card>
              <div className="space-y-3">
                {todaysTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div
                      className={
                        "h-4 w-4 rounded-full border " +
                        (t.done
                          ? "border-transparent gradient-primary"
                          : "border-white/15")
                      }
                    />
                    <span
                      className={
                        "flex-1 text-[13.5px] " +
                        (t.done ? "text-muted-foreground line-through" : "")
                      }
                    >
                      {t.title}
                    </span>
                    {t.time ? <Chip>{t.time}</Chip> : null}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>

        {/* Learning Progress */}
        <section className="space-y-3">
          <SectionHeader
            title="Learning Progress"
            action={<Link to="/learn">See all</Link>}
          />
          <Card>
            <div className="space-y-4">
              {hydrated && roadmaps.slice(0, 4).map((r) => {
                const pct = roadmapPct(r);
                return (
                  <Link
                    key={r.id}
                    to="/learn/$roadmapId"
                    params={{ roadmapId: r.id }}
                    className="block space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium">{r.title}</span>
                      <span className="text-[12px] text-muted-foreground">
                        {hydrated ? `${pct}%` : "—"}
                      </span>
                    </div>
                    <ProgressBar value={hydrated ? pct : 0} tone="gradient" />
                  </Link>
                );
              })}
            </div>
          </Card>
        </section>

        {/* Projects */}
        <section className="space-y-3">
          <SectionHeader
            title="Projects"
            action={<Link to="/projects">See all</Link>}
          />
          {!hydrated || activeProjects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No active projects"
              hint="Ship something. Add a project to start tracking."
            />
          ) : (
            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
              {activeProjects.map((p) => (
                <Link
                  key={p.id}
                  to="/projects"
                  className="card-surface min-w-[220px] max-w-[240px] flex-1 space-y-3 p-5"
                >
                  <Chip tone={p.status === "active" ? "primary" : "success"}>
                    {p.status === "active" ? "In progress" : "Planning"}
                  </Chip>
                  <div className="text-[14px] font-semibold tracking-tight">
                    {p.title}
                  </div>
                  <div className="line-clamp-2 text-[12px] text-muted-foreground">
                    {p.description || "No description"}
                  </div>
                  <ProgressBar value={p.progress} tone="gradient" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Notes */}
        <section className="space-y-3">
          <SectionHeader
            title="Recent Notes"
            action={<Link to="/notes">Open</Link>}
          />
          {!hydrated || recentNotes.length === 0 ? (
            <EmptyState
              icon={StickyNote}
              title="No notes yet"
              hint="Capture ideas as you learn."
            />
          ) : (
            <Card>
              <div className="divide-y divide-white/[0.05]">
                {recentNotes.map((n) => (
                  <Link
                    key={n.id}
                    to="/notes"
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
                      <StickyNote className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-medium">
                        {n.title}
                      </div>
                      <div className="truncate text-[11.5px] text-muted-foreground">
                        {n.body || "Empty"}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </section>

        {/* Operation Rebirth */}
        <section className="space-y-3">
          <SectionHeader
            title="Operation Rebirth"
            action={<Link to="/habits">Habits</Link>}
          />
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2563eb]/20 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-medium">
                  {hydrated
                    ? `${todayHabitCount} / ${habits.length} habits today`
                    : "— / — habits today"}
                </div>
                <Chip tone="primary">
                  <LineChart className="h-3 w-3" /> Track
                </Chip>
              </div>
              <ProgressBar
                value={hydrated && habits.length > 0 ? (todayHabitCount / habits.length) * 100 : 0}
                tone="gradient"
              />
            </div>
          </Card>
        </section>

        <div className="h-4" />

        {/* Floating quick add → planner */}
        <Link
          to="/planner"
          aria-label="Add task"
          className="fixed bottom-28 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full gradient-primary shadow-[0_10px_40px_-10px_rgba(124,58,237,0.6)] transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5 text-white" strokeWidth={2.25} />
        </Link>
      </div>
    </AppShell>
  );
}
