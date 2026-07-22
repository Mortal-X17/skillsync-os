import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ChevronRight, Clock, CheckCircle2, BookOpen } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Card, Chip, ProgressBar } from "@/components/ui/primitives";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { roadmapCounts, roadmapPct } from "@/lib/progress";
import { BottomSheet } from "@/components/edit/Sheet";
import { TextField } from "@/components/edit/Fields";
import { ActionButton, IconButton } from "@/components/edit/Buttons";

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

function LearnPage() {
  const hydrated = useHydrated();
  const roadmaps = useAppStore((s) => s.roadmaps);
  const addRoadmap = useAppStore((s) => s.addRoadmap);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  return (
    <AppShell>
      <PageHeader
        eyebrow="Roadmaps"
        title="Learn."
        subtitle="Curated paths built for depth, not noise."
        right={
          <IconButton
            aria-label="New roadmap"
            variant="primary"
            size="lg"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-[17px] w-[17px]" strokeWidth={2} />
          </IconButton>
        }
      />
      <div className="space-y-4 px-5">
        {!hydrated ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : null}
        {hydrated && roadmaps.map((r) => {
          const pct = hydrated ? roadmapPct(r) : 0;
          const counts = roadmapCounts(r);
          return (
            <Link
              key={r.id}
              to="/learn/$roadmapId"
              params={{ roadmapId: r.id }}
              className="block"
            >
              <Card className="relative overflow-hidden border-white/[0.08] p-5">
                <div
                  className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
                  style={{
                    background: `radial-gradient(circle, ${r.color}, transparent 70%)`,
                  }}
                />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${r.color}, #2563eb)`,
                          boxShadow: `0 10px 30px -10px ${r.color}80`,
                        }}
                      >
                        <BookOpen className="h-5 w-5 text-white" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="text-[16px] font-semibold tracking-tight">
                          {r.title}
                        </div>
                        <div className="text-[12px] text-muted-foreground">
                          {r.subtitle || `${r.phases.length} phases`}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </div>

                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                      <span>Progress</span>
                      <span className="text-foreground/80">
                        {hydrated ? `${pct}%` : "— %"}
                      </span>
                    </div>
                    <ProgressBar value={pct} tone="gradient" />
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Chip>
                      <CheckCircle2 className="h-3 w-3" />
                      {hydrated ? `${counts.done} / ${counts.topics} topics` : "— / — topics"}
                    </Chip>
                    <Chip>
                      <Clock className="h-3 w-3" /> {r.phases.length} phases
                    </Chip>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="New roadmap"
      >
        <div className="space-y-3">
          <label className="block text-[12px] text-muted-foreground">Title</label>
          <TextField
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Systems Design"
          />
          <ActionButton
            className="w-full"
            onClick={() => {
              if (!title.trim()) return;
              addRoadmap(title.trim());
              setTitle("");
              setOpen(false);
            }}
          >
            Create roadmap
          </ActionButton>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
