import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pin, PinOff, StickyNote, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/edit/Sheet";
import { TextField, TextArea } from "@/components/edit/Fields";
import { ActionButton, IconButton } from "@/components/edit/Buttons";
import { useAppStore, useHydrated } from "@/store/useAppStore";

export const Route = createFileRoute("/notes/$noteId/edit")({
  head: () => ({
    meta: [
      { title: "Edit note — SkillSync" },
      { name: "description", content: "Edit a saved note." },
      { property: "og:title", content: "Edit note — SkillSync" },
      { property: "og:description", content: "Edit a saved note." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NoteEditor,
});

function NoteEditor() {
  const { noteId } = Route.useParams();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const note = useAppStore((s) => s.notes.find((n) => n.id === noteId));
  const updateNote = useAppStore((s) => s.updateNote);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <AppShell>
      <header className="mb-5 flex items-center justify-between px-5 lg:px-2">
        <Link
          to="/notes/$noteId"
          params={{ noteId }}
          className="glass flex h-10 w-10 items-center justify-center rounded-full active:scale-95"
          aria-label="Back to note"
        >
          <ArrowLeft className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.75} />
        </Link>
        {note ? (
          <IconButton
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            variant={note.pinned ? "primary" : "ghost"}
            size="lg"
            onClick={() => updateNote(note.id, { pinned: !note.pinned })}
          >
            {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </IconButton>
        ) : null}
      </header>

      {!note ? (
        hydrated ? (
          <div className="px-5 lg:px-2">
            <EmptyState icon={StickyNote} title="Note not found" hint="It may have been deleted." />
          </div>
        ) : null
      ) : (
        <div className="space-y-4 px-5 lg:px-2">
          <TextField
            value={note.title}
            onChange={(e) => updateNote(note.id, { title: e.target.value })}
            placeholder="Title"
            className="text-[16px] font-semibold"
          />
          <TextArea
            rows={14}
            value={note.body}
            onChange={(e) => updateNote(note.id, { body: e.target.value })}
            placeholder="Start typing…"
          />
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted-foreground">
              Tags (comma separated)
            </label>
            <TextField
              className="mt-1.5"
              defaultValue={note.tags.join(", ")}
              onBlur={(e) =>
                updateNote(note.id, {
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <ActionButton variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete note
          </ActionButton>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete note?"
        onConfirm={() => {
          deleteNote(noteId);
          navigate({ to: "/notes" });
        }}
      />
    </AppShell>
  );
}
