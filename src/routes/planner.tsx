import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Card, Chip, SectionHeader, Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Planner — SkillSync" },
      { name: "description", content: "Calendar, focus tasks and weekly overview." },
      { property: "og:title", content: "Planner — SkillSync" },
      { property: "og:description", content: "Plan your week with intention." },
    ],
  }),
  component: PlannerPage,
});

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function PlannerPage() {
  const today = new Date();
  const day = today.getDay();
  const monIdx = (day + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - monIdx);
  const weekDates = weekdays.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Planner"
        title="This week."
        subtitle="Design your days with intention."
        right={
          <div className="glass flex items-center rounded-full">
            <button className="flex h-10 w-10 items-center justify-center rounded-full active:scale-95">
              <ChevronLeft className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.75} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full active:scale-95">
              <ChevronRight className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.75} />
            </button>
          </div>
        }
      />

      <div className="space-y-6 px-5">
        {/* Week strip */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-[13px] font-medium">
              {monday.toLocaleString(undefined, { month: "long", year: "numeric" })}
            </span>
            <Chip tone="primary">Week —</Chip>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weekDates.map((d, i) => {
              const isToday = d.toDateString() === today.toDateString();
              return (
                <button
                  key={i}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border py-2.5 transition-all active:scale-[0.96]",
                    isToday
                      ? "border-transparent gradient-primary text-white shadow-[0_10px_30px_-10px_rgba(124,58,237,0.6)]"
                      : "border-white/[0.05] bg-white/[0.02] text-muted-foreground",
                  )}
                >
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    {weekdays[i]}
                  </span>
                  <span className="text-[15px] font-semibold tracking-tight text-foreground">
                    {d.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Today */}
        <section className="space-y-3">
          <SectionHeader title="Today" action="Add" />
          <Card>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border border-white/15" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-2.5 w-2/3" />
                    <Skeleton className="h-2 w-1/3" />
                  </div>
                  <Chip>—:—</Chip>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Upcoming */}
        <section className="space-y-3">
          <SectionHeader title="Upcoming" action="See all" />
          <Card>
            <div className="divide-y divide-white/[0.05]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-white/[0.03]">
                    <span className="text-[9px] font-medium uppercase text-muted-foreground">
                      —
                    </span>
                    <span className="text-[14px] font-semibold">—</span>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-2.5 w-2/3" />
                    <Skeleton className="h-2 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Weekly overview */}
        <section className="space-y-3">
          <SectionHeader title="Weekly Overview" />
          <Card>
            <div className="grid grid-cols-7 items-end gap-2 pt-2">
              {weekdays.map((d) => (
                <div key={d} className="flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-md bg-white/[0.06]"
                    style={{ height: `${20 + Math.random() * 40}px` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{d[0]}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
