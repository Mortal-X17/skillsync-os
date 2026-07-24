import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, ChevronRight, GraduationCap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Chip, ProgressBar } from "@/components/ui/primitives";
import { EmptyState } from "@/components/common/EmptyState";
import { useAppStore, useHydrated } from "@/store/useAppStore";

export const Route = createFileRoute("/attendance/")({
  head: () => ({
    meta: [
      { title: "Attendance — SkillSync" },
      { name: "description", content: "Track subject attendance across every semester." },
      { property: "og:title", content: "Attendance — SkillSync" },
      { property: "og:description", content: "Semester-wise attendance tracker." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AttendancePage,
});

function subjectPct(present: number, absent: number): number {
  const total = present + absent;
  if (total <= 0) return 0;
  return Math.round((present / total) * 100);
}

function AttendancePage() {
  const hydrated = useHydrated();
  const enabled = useAppStore((s) => s.preferences.modules.attendance);
  const subjects = useAppStore((s) => s.attendance.subjects);

  const bySem = useMemo(() => {
    const map = new Map<number, typeof subjects>();
    for (let i = 1; i <= 8; i++) map.set(i, []);
    for (const s of subjects) {
      const arr = map.get(s.semester);
      if (arr) arr.push(s);
    }
    return map;
  }, [subjects]);

  const overall = useMemo(() => {
    let p = 0;
    let a = 0;
    for (const s of subjects) {
      p += s.present;
      a += s.absent;
    }
    return { present: p, absent: a, pct: subjectPct(p, a), total: p + a };
  }, [subjects]);

  if (hydrated && !enabled) {
    return <Navigate to="/profile/modules" />;
  }

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
            College
          </div>
          <h1 className="truncate text-[22px] font-semibold leading-tight tracking-[-0.02em]">
            Attendance.
          </h1>
        </div>
      </header>

      <div className="space-y-5 px-5 pb-24">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary">
              <GraduationCap className="h-5 w-5 text-white" strokeWidth={1.75} />
            </span>
            <div className="flex-1">
              <div className="text-[12px] text-muted-foreground">
                Overall attendance
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[28px] font-semibold tracking-tight">
                  {overall.pct}%
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {overall.present}/{overall.total} classes
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={overall.pct} tone="gradient" />
          </div>
        </Card>

        {subjects.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No subjects yet"
            hint="Open a semester to add your first subject."
          />
        ) : null}

        <section className="space-y-2.5">
          {Array.from({ length: 8 }).map((_, i) => {
            const sem = i + 1;
            const arr = bySem.get(sem) ?? [];
            let p = 0;
            let a = 0;
            for (const s of arr) {
              p += s.present;
              a += s.absent;
            }
            const pct = subjectPct(p, a);
            return (
              <Link
                key={sem}
                to="/attendance/$semester"
                params={{ semester: String(sem) }}
                className="card-surface flex items-center gap-3 p-4 transition-all active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-[13px] font-semibold">
                  {sem}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold tracking-tight">
                    Semester {sem}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted-foreground">
                    <Chip>{arr.length} subjects</Chip>
                    {p + a > 0 ? <Chip tone="primary">{pct}%</Chip> : null}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </Link>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
