import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2, Pin, PinOff, Search, StickyNote } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/primitives";
import { EmptyState } from "@/components/common/EmptyState";
import { BottomSheet, ConfirmDialog } from "@/components/edit/Sheet";
import { TextField, TextArea } from "@/components/edit/Fields";
import { ActionButton, IconButton } from "@/components/edit/Buttons";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import type { Note } from "@/lib/schema";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes — SkillSync" },
      { name: "description", content: "Capture ideas, autosaved and searchable." },
      { property: "og:title", content: "Notes — SkillSync" },
      { property: "og:description", content: "Ideas, autosaved and searchable." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const hydrated = useHydrated();
  const notes = useAppStore((s) => s.notes);
  const addNote = useAppStore((s) => s.addNote);
  const updateNote = useAppStore((s) => s.updateNote);
  const deleteNote = useAppStore((s) => s.deleteNote);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.body.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q)),
        )
      : notes;
    return [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [notes, query]);

  const current = editing ? notes.find((n) => n.id === editing.id) ?? editing : null;

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
          aria-label="New note"
          onClick={() => {
            const n = addNote({ title: "Untitled" });
            setEditing(n);
          }}
        >
          <Plus className="h-[17px] w-[17px]" strokeWidth={2} />
        </IconButton>
      </header>
      <div className="mb-4 px-5">
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em]">
          Notes.
        </h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Autosaved. Yours forever.
        </p>
      </div>

      <div className="mb-4 px-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-3 px-5">
        {hydrated && filtered.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            title={query ? "No matches" : "No notes yet"}
            hint={query ? undefined : "Tap + to capture your first idea."}
          />
        ) : null}
        {filtered.map((n) => (
          <button
            key={n.id}
            onClick={() => setEditing(n)}
            className="block w-full text-left"
          >
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {n.pinned ? (
                      <Pin className="h-3.5 w-3.5 text-[#c4b5fd]" />
                    ) : null}
                    <div className="truncate text-[14.5px] font-semibold tracking-tight">
                      {n.title}
                    </div>
                  </div>
                  {n.body ? (
                    <div className="mt-1 line-clamp-2 text-[12.5px] text-muted-foreground">
                      {n.body}
                    </div>
                  ) : null}
                  {n.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {n.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span className="text-[10.5px] text-muted-foreground/70">
                  {new Date(n.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </Card>
          </button>
        ))}
      </div>

      <BottomSheet
        open={!!current}
        onClose={() => setEditing(null)}
        title="Note"
        className="max-h-[95dvh]"
      >
        {current ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TextField
                value={current.title}
                onChange={(e) =>
                  updateNote(current.id, { title: e.target.value })
                }
                placeholder="Title"
                className="text-[16px] font-semibold"
              />
              <IconButton
                aria-label="Pin"
                onClick={() =>
                  updateNote(current.id, { pinned: !current.pinned })
                }
                variant={current.pinned ? "primary" : "ghost"}
              >
                {current.pinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </IconButton>
            </div>
            <TextArea
              rows={10}
              value={current.body}
              onChange={(e) => updateNote(current.id, { body: e.target.value })}
              placeholder="Start typing…"
            />
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                Tags (comma separated)
              </label>
              <TextField
                className="mt-1.5"
                defaultValue={current.tags.join(", ")}
                onBlur={(e) =>
                  updateNote(current.id, {
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <ActionButton
              variant="danger"
              className="w-full"
              onClick={() => setConfirmDelete(current.id)}
            >
              <Trash2 className="h-4 w-4" /> Delete note
            </ActionButton>
          </div>
        ) : null}
      </BottomSheet>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete note?"
        onConfirm={() => {
          if (confirmDelete) {
            deleteNote(confirmDelete);
            setEditing(null);
          }
        }}
      />
    </AppShell>
  );
}
