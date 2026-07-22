## Scope

Turn the current visual foundation into a fully functional, offline, local-first SkillSync OS you can use daily. Keep the existing dark premium aesthetic — no restyle. Prepare for Android via Capacitor with clear build steps.

Given the size of the request, I'll build this in one continuous pass but focused on **stability and daily usability over feature breadth**. Advanced flourishes (rich analytics charts, drag reordering with animations) will be present but lean.

## What ships in this release

### 1. Local-first data layer (foundation)
- Versioned JSON schema (`schemaVersion: 1`) in `localStorage` under a single key `skillsync:data:v1`.
- Migration runner ready for future versions (no-op today).
- Zustand store with autosave on every mutation (debounced write).
- Zod validation for import.
- Manual **Export** (download `.json`) and **Import** (file picker, validate, replace) in Profile → Backup.

Entities: `roadmaps`, `phases`, `topics`, `subtopics`, `checklistItems`, `notes`, `projects`, `habits`, `habitLogs`, `plannerTasks`, `profile`, `stats` (xp, level, streak).

### 2. Learn (Learning Engine) — core module
- Default scaffolded roadmaps: Python, AI/ML, DSA, Web Dev (empty phases, ready to fill).
- Tree: Roadmap → Phase → Topic → Subtopic → Checklist items.
- Every node: create / rename / delete / reorder (up/down buttons — no DnD in v1) / collapse.
- Topics & subtopics: notes, resources (list of {label,url}), completion toggle.
- Progress auto-rolls up from checklist → subtopic → topic → phase → roadmap.
- Detail screen per roadmap with inline editors (sheet/dialog).

### 3. Notes
- Standalone + attached (via `linkedTo: {type, id}`).
- Title, body (textarea), tags, pinned, search, autosave.
- List with pinned first, search bar, tag chips.

### 4. Dashboard
- Greeting + date, streak / XP / level cards (real values from store).
- Today's focus (top 3 planner tasks due today).
- Learning progress summary (per roadmap % bars).
- Recent notes (last 3).
- Quick actions.

### 5. Projects
- CRUD: title, description, status (planning/active/done), progress %, deadline, techStack[], tasks[], notes, githubUrl.
- Card list + detail sheet with edit.

### 6. Planner
- Daily tasks with date, title, done toggle, time (optional).
- Week strip navigates dates; add/edit/delete.
- Today section pulls from selected date.

### 7. Operation Rebirth (Habits) — new route `/habits`
- Habit list: sleep, workout, reading, coding, screen time, walking, meditation, custom.
- Daily check-off, streak per habit.
- Added to bottom nav? No — keep 5 tabs. Access from Dashboard quick action + Profile. (Bottom nav stays: Dashboard, Learn, Projects, Planner, Profile.)

### 8. Profile / Settings
- Profile: name, avatar initials, level, XP, streak (from stats).
- Preferences: theme (dark only for now, shown as info), notifications toggle (stored, non-functional stub).
- Backup: Export, Import, Reset.
- Developer mode toggle (unlocks a "Danger zone" and shows storage size).
- About.

### 9. Analytics
- Reachable from Profile ("View analytics").
- Cards: roadmap completion %, topic completion, habit consistency (7-day), streak, project progress. Simple bars — no chart lib.

### 10. Android / APK packaging
- Add Capacitor config + `capacitor.config.ts` targeting `com.skillsync.os`.
- Add `scripts/android-setup.md` with exact steps:
  1. `bun run build`
  2. `bunx cap add android`
  3. `bunx cap sync`
  4. `cd android && ./gradlew assembleDebug` → APK at `android/app/build/outputs/apk/debug/app-debug.apk`
- Note: **I cannot generate the APK inside this sandbox** (no Android SDK / Gradle). The project will be Android-ready — you run the two commands above on any machine with Android Studio installed.
- Ensure no Lovable badge on the deployed/exported build.

### 11. Lovable badge
- Disable the Lovable badge on published site via publish settings.

## What is intentionally NOT in this release
- Drag-and-drop reordering (using up/down arrow buttons).
- Rich text notes (plain textarea).
- Cloud sync, Google Drive.
- Real notifications (toggle stored only).
- Chart library (bars only).
- Auth (not needed — personal, local).

## Technical notes

- Storage: `localStorage` behind `src/lib/storage.ts` abstraction so it can swap to IndexedDB later without touching store logic.
- State: `zustand` + `zustand/middleware` `persist` with custom storage adapter and versioned migrations.
- Validation: `zod` schemas for the whole data tree; used on import.
- Editing UX: shadcn `Sheet` / `Dialog` + inline forms. Delete uses confirm dialog.
- All new routes registered under `src/routes/` (`learn.$roadmap.tsx`, `habits.tsx`, `notes.tsx`, `analytics.tsx`, project/planner detail sheets stay inline).
- Existing `AppShell`, `BottomNav`, `Card`, `Chip`, `ProgressBar` reused as-is.
- Data survives updates because it lives in `localStorage` keyed by schema version — future schema bumps run migrations, never wipe.

## File map (new / changed)

```text
src/
  lib/
    storage.ts            # localStorage adapter + JSON codec
    schema.ts             # zod types + TS types
    migrations.ts         # version -> version fns
    id.ts                 # nanoid wrapper
    seed.ts               # default empty roadmaps
    progress.ts           # rollup helpers
    date.ts               # date helpers
  store/
    useAppStore.ts        # zustand root store (persist)
    selectors.ts
  components/
    edit/
      InlineEditField.tsx
      ConfirmDialog.tsx
    learn/
      RoadmapCard.tsx
      PhaseBlock.tsx
      TopicRow.tsx
      SubtopicRow.tsx
      ChecklistEditor.tsx
      NotesEditor.tsx
    notes/NoteCard.tsx
    projects/ProjectSheet.tsx
    planner/TaskRow.tsx
    habits/HabitRow.tsx
    common/EmptyState.tsx
  routes/
    index.tsx             # rebuilt dashboard (real data)
    learn.tsx             # roadmap grid (real progress)
    learn.$roadmapId.tsx  # roadmap detail (tree editor)
    projects.tsx          # CRUD
    planner.tsx           # CRUD
    profile.tsx           # settings + backup
    notes.tsx             # notes list
    habits.tsx            # Operation Rebirth
    analytics.tsx         # summary
capacitor.config.ts
scripts/android-setup.md
```

Packages added: `zustand`, `zod`, `nanoid`, `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`.

## Delivery

After build:
1. App fully usable at the preview URL — create/edit/delete everything, data persists on refresh.
2. Export/import verified.
3. Android setup doc + Capacitor config committed.
4. Lovable badge disabled on published site.
5. You run the 4 Android commands locally to produce `app-debug.apk`.
