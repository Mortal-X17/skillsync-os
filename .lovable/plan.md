This is a large batch. I'll ship it in one coherent pass, grouped by area. Everything stays local-first, matches the existing premium dark UI, and plugs into the current Zustand store + backup envelope.

## 1. Autofill audit
- Verify every `<input>` / `<textarea>` in the app routes through `TextField` / `TextArea` from `src/components/edit/Fields.tsx` (which already applies `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`, `spellCheck={false}`, `data-form-type`, `data-lpignore`, `data-1p-ignore`, `data-bwignore`).
- Sweep `src/routes/*` and `src/components/**` with ripgrep for raw `<input`/`<textarea`; migrate any stragglers (search bars, planner inputs, habit rename, subject/expense forms) to the shared components. New forms below use `TextField`/`TextArea` from day one.

## 2. Roadmap interaction upgrade (`src/routes/learn.$roadmapId.tsx`, `src/lib/progress.ts`, `src/store/useAppStore.ts`)
Data model stays as-is. Behavior changes:
- Every subtopic is now expandable and lazily renders its checklist. Expand state is kept in a local `Set<string>` per topic/subtopic keyed by id, lost on route unmount (per spec: "while the page is open").
- Progress is derived purely from checklist leaves:
  - Subtopic: if it has checklist → `done/total`; otherwise treat the subtopic's own `done` flag as a synthetic single leaf (backwards compatible with topics/subtopics created without checklist).
  - Topic %: average of (its direct checklist leaves + each subtopic's leaves), flattened — a single pool of leaves under the topic, so weighting is by leaf count, not by nesting level.
  - Phase %: flattened leaves across its topics. Roadmap %: flattened leaves across all phases.
- `progress.ts` gets `leafStats(node)` returning `{done,total}`; existing `topicPct/phasePct/roadmapPct` become thin wrappers.
- Cascading writes (new store actions):
  - `setPhaseComplete(rid, pid, done)` → set every checklist item + subtopic.done + topic.done under that phase.
  - `setTopicComplete(rid, pid, tid, done)` → every checklist + subtopic.done under it.
  - `setSubtopicComplete(rid, pid, tid, sid, done)` → every checklist in it + subtopic.done.
- Reverse sync: after any checklist toggle, walk up and set subtopic.done / topic.done based on `allLeavesDone()`. Existing checklist toggle actions get a post-update normalization step so parents stay in sync automatically. Any incomplete leaf → all ancestors flip to incomplete.
- UI: `▶` / `▼` chevrons on topics and subtopics with `animate-accordion-down/up`. One-tap "complete section" is a checkbox on phase, topic, and subtopic rows that calls the corresponding cascade action. Collapsed subtopics don't render checklist DOM.

## 3. Habit start date editing (`src/routes/habits.$habitId.tsx`, `HabitSchema`, migrations, stats)
- Add optional `startDate: string | null` to `HabitSchema` (YYYY-MM-DD). Migration fills it from the earliest log or `createdAt`.
- Edit Habit sheet gains a Start Date row using the shadcn `Popover` + `Calendar` pattern (`pointer-events-auto`), disabled for future dates.
- All stats (Since, success rate, total tracking days, weekly/monthly, calendar) filter logs by `date >= startDate`. Existing check-ins before the new start date are preserved but excluded from math.
- If new start date changes the effective tracking window vs. current, show a confirm dialog before saving.

## 4. Backup section redesign
- New route `src/routes/profile.backup.tsx` housing: Status card, Create Backup, Restore Backup, Backup Information, and Danger Zone (Reset SkillSync).
- Move all logic from `BackupSection.tsx` into this route; the component keeps the sheets/previews. Delete the "What's Included" tile — Backup Information is the single source.
- `src/routes/profile.tsx` Backup section collapses to one tile: `🛡️ Backup & Restore →` linking to `/profile/backup`. Reset SkillSync no longer appears on Profile.

## 5. Learn page UI consistency (`src/routes/learn.index.tsx`, `AppShell` `PageHeader`)
- Roadmap card icon becomes a fixed `h-11 w-11 shrink-0 rounded-full` (was larger / could stretch). Text column gets `min-w-0` + `truncate` where needed so long titles never squeeze the icon.
- Learn `PageHeader` uses the same title/subtitle sizing + top padding as Projects (align tokens; drop the oversized variant on Learn).
- FAB (`+`) in the header shrinks to match Projects' add button diameter and margin from the top/right safe area. Same color, icon, animation.

## 6. College Attendance Tracker V1
- Schema additions (`src/lib/schema.ts` + migration bump):
  - `Subject { id, semester: 1..8, name, faculty?, minRequired: number (default 75), present: number, absent: number, createdAt }`.
  - `AppData.attendance.subjects: Subject[]`.
  - `PreferencesSchema.modules: { attendance: boolean, expenses: boolean }` (default both `false`).
- Store actions: `addSubject`, `updateSubject`, `deleteSubject`, `setModuleEnabled`. Selectors compute per-subject %, per-semester % (sum present / sum total), overall % (all subjects pooled — never average of %).
- Routes:
  - `profile.modules.tsx` toggle page (Attendance + Expense Manager toggles).
  - `attendance.tsx` layout → `attendance.index.tsx` (Overall + 8 semester tiles) → `attendance.$semester.tsx` (subject list + FAB Add Subject + edit/delete via ⋮).
- Dashboard shows a compact widget only when `preferences.modules.attendance` is true: Overall %, current semester (highest semester with data, fallback to 1), and a Quick Access link.
- Present/Absent are read-only in V1 (spec: no manual entry). Cards show `0 / 0 / 0%` initially. Architecture ready for date-wise marking later.

## 7. Expense Manager V1
- Schema: `Transaction { id, title, amount: number, type: 'credit'|'debit', at: number }`; stored in `AppData.expenses.transactions`. No categories/filters etc.
- Routes: `expenses.tsx` layout → `expenses.index.tsx` current month by default with month switcher (prev/next chevrons + label). Summary: Total Credit (green), Total Debit (red), Balance. List grouped by month, reverse chronological. FAB opens Add Transaction bottom sheet.
- Entry point: Profile tile `Expense Manager` (visible only when module toggle on, matching Attendance).
- Automatically included in backups (already covered — backup envelope serializes full `AppData`).

## 8. Backup envelope & migrations
- Bump `CURRENT_SCHEMA_VERSION` to 2. `migrate()` fills `habits[].startDate`, `attendance`, `expenses`, and `preferences.modules` defaults so old backups restore cleanly.
- `BACKUP_VERSION` stays 1 (envelope shape unchanged, only inner `AppData` grew) — restore keeps working on older/newer devices.

## Technical notes
- Zustand actions use immer-style shallow copies as already established in `useAppStore.ts`.
- Recursive completion helpers live in `src/lib/roadmap-ops.ts` (new) to keep the store lean.
- Date picker uses existing shadcn `Calendar` + `Popover`, `pointer-events-auto`.
- New routes registered by TanStack file-based routing (auto). Each new leaf route gets its own `head()` with unique title + description.

```text
routes/
  attendance.tsx
  attendance.index.tsx
  attendance.$semester.tsx
  expenses.tsx
  expenses.index.tsx
  profile.backup.tsx
  profile.modules.tsx
```

## Out of scope (deferred per spec)
Attendance date marking, analytics, safe-bunk math; expense categories/charts/budgets/search/filters/notes/export.

Reply "go" to build, or tell me what to adjust.