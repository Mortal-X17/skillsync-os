import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2, Flame } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/primitives";
import { EmptyState } from "@/components/common/EmptyState";
import { BottomSheet, ConfirmDialog } from "@/components/edit/Sheet";
import { TextField } from "@/components/edit/Fields";
import { ActionButton, IconButton } from "@/components/edit/Buttons";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { todayISO, addDaysISO } from "@/lib/date";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/habits")({
  head: () => ({
    meta: [
      { title: "Habits — SkillSync" },
      { name: "description", content: "Daily habit tracking. Small steps compound." },
      { property: "og:title", content: "Habits — SkillSync" },
      { property: "og:description", content: "Small steps compound daily." },
    ],
  }),
  component: HabitsPage,
});

function HabitsPage() {
  const hydrated = useHydrated();
  const habits = useAppStore((s) => s.habits);
  const habitLogs = useAppStore((s) => s.habitLogs);
  const addHabit = useAppStore((s) => s.addHabit);
  const renameHabit = useAppStore((s) => s.renameHabit);
  const deleteHabit = useAppStore((s) => s.deleteHabit);
  const toggleHabitToday = useAppStore((s) => s.toggleHabitToday);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; title: string } | null>(null);

  const today = todayISO();
  const last7 = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDaysISO(today, -6 + i)),
    [today],
  );

  const streakFor = (habitId: string) => {
    let streak = 0;
    for (let i = 0; ; i++) {
      const d = addDaysISO(today, -i);
      const hit = habitLogs.some((l) => l.habitId === habitId && l.date === d);
      if (hit) streak++;
      else break;
    }
    return streak;
  };

  return (
    <AppShell>
      <header className="mb-5 flex items-center justify-between px-5">
        <Link
          to="/"
          className="glass flex h-10 w-10 items-center justify-center rounded-full active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.75} />
        </Link>
        <IconButton
          variant="primary"
          size="lg"
          aria-label="New habit"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-[17px] w-[17px]" strokeWidth={2} />
        </IconButton>
      </header>

      <div className="mb-6 px-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Operation Rebirth
        </div>
        <h1 className="mt-1.5 text-[28px] font-semibold leading-tight tracking-[-0.02em]">
          Habits.
        </h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Show up daily. Compound quietly.
        </p>
      </div>

      <div className="space-y-3 px-5">
        {hydrated && habits.length === 0 ? (
          <EmptyState title="No habits yet" hint="Add habits like Sleep, Reading, Workout." />
        ) : null}
        {habits.map((h) => {
          const doneToday = habitLogs.some(
            (l) => l.habitId === h.id && l.date === today,
          );
          const streak = streakFor(h.id);
          return (
            <Card key={h.id} className="p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleHabitToday(h.id)}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl text-[18px] transition-all active:scale-95",
                    doneToday
                      ? "gradient-primary shadow-[0_10px_30px_-10px_rgba(124,58,237,0.6)]"
                      : "bg-white/[0.04]",
                  )}
                >
                  <span>{h.emoji}</span>
                </button>
                <button
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setRenaming({ id: h.id, title: h.title })}
                >
                  <div className="truncate text-[14.5px] font-semibold tracking-tight">
                    {h.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
                    <Flame className="h-3 w-3" /> {streak} day streak
                  </div>
                </button>
                <IconButton
                  size="sm"
                  variant="danger"
                  aria-label="Delete"
                  onClick={() => setConfirmDelete(h.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>

              <div className="mt-4 flex justify-between gap-1.5">
                {last7.map((iso) => {
                  const done = habitLogs.some(
                    (l) => l.habitId === h.id && l.date === iso,
                  );
                  const isToday = iso === today;
                  return (
                    <button
                      key={iso}
                      onClick={() => toggleHabitToday(h.id, iso)}
                      className={cn(
                        "flex h-8 flex-1 items-center justify-center rounded-lg border text-[10px] font-medium transition-all",
                        done
                          ? "border-transparent gradient-primary text-white"
                          : "border-white/[0.06] bg-white/[0.02] text-muted-foreground",
                        isToday && !done ? "border-white/20" : "",
                      )}
                    >
                      {new Date(iso).getDate()}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="New habit">
        <div className="space-y-3">
          <div className="flex gap-2">
            <TextField
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-16 text-center text-[20px]"
              maxLength={2}
            />
            <TextField
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Habit name"
              className="flex-1"
            />
          </div>
          <ActionButton
            className="w-full"
            onClick={() => {
              if (!title.trim()) return;
              addHabit(title.trim(), emoji || "✨");
              setTitle("");
              setEmoji("✨");
              setOpen(false);
            }}
          >
            Add habit
          </ActionButton>
        </div>
      </BottomSheet>

      <BottomSheet
        open={!!renaming}
        onClose={() => setRenaming(null)}
        title="Rename habit"
      >
        {renaming ? (
          <div className="space-y-3">
            <TextField
              autoFocus
              value={renaming.title}
              onChange={(e) => setRenaming({ ...renaming, title: e.target.value })}
            />
            <ActionButton
              className="w-full"
              onClick={() => {
                if (!renaming.title.trim()) return;
                renameHabit(renaming.id, renaming.title.trim());
                setRenaming(null);
              }}
            >
              Save
            </ActionButton>
          </div>
        ) : null}
      </BottomSheet>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete habit?"
        onConfirm={() => confirmDelete && deleteHabit(confirmDelete)}
      />
    </AppShell>
  );
}
