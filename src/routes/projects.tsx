import { createFileRoute } from "@tanstack/react-router";
import { Plus, CircleDot, CircleDashed, CheckCircle2, Filter } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Card, Chip, ProgressBar, Skeleton } from "@/components/ui/primitives";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — SkillSync" },
      { name: "description", content: "Ship real work. Track status, deadlines and tech stack." },
      { property: "og:title", content: "Projects — SkillSync" },
      { property: "og:description", content: "Ship real work and track progress." },
    ],
  }),
  component: ProjectsPage,
});

const filters = [
  { label: "All", icon: CircleDot },
  { label: "Active", icon: CircleDashed },
  { label: "Done", icon: CheckCircle2 },
];

function ProjectsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Workspace"
        title="Projects."
        subtitle="Everything you're building, in one place."
        right={
          <button
            aria-label="Filter"
            className="glass flex h-10 w-10 items-center justify-center rounded-full active:scale-95"
          >
            <Filter className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.75} />
          </button>
        }
      />

      <div className="mb-5 flex gap-2 px-5">
        {filters.map((f, i) => {
          const Icon = f.icon;
          const active = i === 0;
          return (
            <button
              key={f.label}
              className={
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors " +
                (active
                  ? "border-white/10 bg-white/[0.06] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground/80")
              }
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 px-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Chip tone={i % 2 === 0 ? "primary" : "success"}>
                    {i % 2 === 0 ? "In progress" : "Planning"}
                  </Chip>
                  <Chip>Due — · —</Chip>
                </div>
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                <span>Progress</span>
                <span className="text-foreground/80">— %</span>
              </div>
              <ProgressBar value={0} tone="gradient" />
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {["—", "—", "—"].map((t, j) => (
                <span
                  key={j}
                  className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10.5px] font-medium text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <button
        aria-label="New project"
        className="fixed bottom-28 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full gradient-primary shadow-[0_10px_40px_-10px_rgba(124,58,237,0.7)] transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6 text-white" strokeWidth={2.25} />
      </button>
    </AppShell>
  );
}
