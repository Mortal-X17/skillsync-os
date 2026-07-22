import { createFileRoute } from "@tanstack/react-router";
import { Code2, BrainCircuit, Binary, Globe, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Card, Chip, ProgressBar } from "@/components/ui/primitives";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — SkillSync" },
      { name: "description", content: "Structured learning roadmaps for Python, AI/ML, DSA and Web." },
      { property: "og:title", content: "Learn — SkillSync" },
      { property: "og:description", content: "Structured learning roadmaps and progress." },
    ],
  }),
  component: LearnPage,
});

type Roadmap = {
  title: string;
  subtitle: string;
  icon: typeof Code2;
  from: string;
  to: string;
  accent: string;
};

const roadmaps: Roadmap[] = [
  {
    title: "Python",
    subtitle: "Foundations → Mastery",
    icon: Code2,
    from: "#7c3aed",
    to: "#2563eb",
    accent: "#a78bfa",
  },
  {
    title: "AI / ML",
    subtitle: "Math · Models · Systems",
    icon: BrainCircuit,
    from: "#2563eb",
    to: "#0ea5e9",
    accent: "#7dd3fc",
  },
  {
    title: "DSA",
    subtitle: "Patterns · Problems",
    icon: Binary,
    from: "#18181b",
    to: "#3f3f46",
    accent: "#a1a1aa",
  },
  {
    title: "Web Development",
    subtitle: "Frontend · Backend · Infra",
    icon: Globe,
    from: "#7c3aed",
    to: "#db2777",
    accent: "#f9a8d4",
  },
];

function LearnPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Roadmaps"
        title="Learn."
        subtitle="Curated paths built for depth, not noise."
      />
      <div className="space-y-4 px-5">
        {roadmaps.map((r) => {
          const Icon = r.icon;
          return (
            <Card
              key={r.title}
              className="relative overflow-hidden border-white/[0.08] p-5"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
                style={{ background: `radial-gradient(circle, ${r.from}, transparent 70%)` }}
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${r.from}, ${r.to})`,
                        boxShadow: `0 10px 30px -10px ${r.from}80`,
                      }}
                    >
                      <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="text-[16px] font-semibold tracking-tight">
                        {r.title}
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        {r.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                </div>

                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                    <span>Progress</span>
                    <span className="text-foreground/80">— %</span>
                  </div>
                  <ProgressBar value={0} tone="gradient" />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Chip>
                    <CheckCircle2 className="h-3 w-3" /> — / — topics
                  </Chip>
                  <Chip>
                    <Clock className="h-3 w-3" /> ~ — hrs
                  </Chip>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
