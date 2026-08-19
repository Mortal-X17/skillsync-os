# Polish pass: backup save/share, single appearance control, What's Included, expense drag

Four focused fixes. No redesign, no new dependencies.

## 1. Backup Save + Share actually work

Today "Save backup" creates a blob and clicks a hidden `<a download>`, and "Share" uses `navigator.share`. Inside the Android WebView the anchor download is silently dropped and Web Share with files is unavailable, so both buttons appear to do nothing.

Fix, using the already-generated backup text as the single source of truth:

- Add two methods to the existing native plugin (`SkillSyncNativePlugin.java`): `saveFile` and `shareFile`, both taking `{ filename, mimeType, text }`.
  - Save writes through MediaStore into the public Downloads folder (Android 10+) with a legacy path fallback, then returns the resulting location so the app can confirm it.
  - Share writes the file into the app cache and hands it to the system share sheet via the existing `${applicationId}.fileprovider` (needs `cache-path` entry, already present) with a read permission grant.
- Expose `nativeSaveFile` / `nativeShareFile` in `src/lib/native/bridge.ts`, returning a discriminated result (`saved` / `cancelled` / `unsupported` / `error`).
- In `BackupSection.tsx`, route both buttons through one helper chain:
  1. native bridge when present,
  2. else `showSaveFilePicker` (Chromium desktop) for Save, `navigator.share({files})` for Share,
  3. else anchor download as the last resort.
- Feedback: success toast naming the file (and folder when known), a neutral toast on cancel, and an explicit error toast on failure. No silent paths. Buttons show a busy state while the write runs.
- The sheet's visual design is unchanged apart from the busy/disabled state.

## 2. One appearance control: Background (4 options)

Remove the separate Theme setting; Background becomes the only appearance source of truth.

- `BackgroundStyle` gains a fourth value `"light"`, labelled **Minimalist Light**, with a swatch matching the existing light palette. The three existing options keep their exact behaviour.
- `src/hooks/use-theme.tsx` derives the resolved theme from `preferences.background` (`light` → light, everything else → dark) instead of `preferences.theme`. All existing light-theme CSS, `LightAtmosphereBackground`, launch-screen glow, and the Android system-bar mirroring keep working unchanged.
- `AppBackground` renders `LightAtmosphereBackground` for the `light` background and the existing components otherwise.
- Profile → Preferences: the Theme row and its sheet are removed; the Background sheet lists four options.
- Migration: schema drops `theme` from preferences (accepting and discarding legacy values). A store migration maps an existing saved `theme: "light"` (with a non-light background) onto `background: "light"` once, so nobody loses their light appearance; everything else keeps its background as-is. Persist version bumps so old data upgrades cleanly instead of crashing.

## 3. "What's Included" becomes its own screen

Both tiles currently open the same sheet (`setInfoOpen`).

- **Backup Information** keeps its existing content: how snapshots are made, that data lives locally on the device, restore behaviour (full replace), backup/app version fields, and limitations (JSON file, device-local, no cloud sync).
- **What's Included** gets a new sheet driven by the real data model — the same categories the backup writer actually serialises (roadmaps and their phases/topics/subtopics/checklists, notes, projects, planner tasks, habits and habit logs, attendance, expenses, preferences, profile), each with the live count from the current workspace, plus a short plain-language "what you can recover if you restore this" line. It also states what is *not* included (nothing outside SkillSync's local data).
- Category list is generated from the backup summary helpers in `src/lib/backup.ts`, extended so attendance and expenses are counted too — no hardcoded claims.

## 4. Expense long-press drag feels immediate

Current implementation causes the observed freeze/lag:

- Every pointer move calls `setDy`, re-rendering the whole list; crossing a row calls `setOrder`, re-rendering again and re-running the `useMemo` mapping.
- Auto-scroll clears and re-creates a `setInterval` on *every* move event.
- `pointermove` listeners are on `document` without pointer capture, so the WebView can steal the gesture, and the row only sets `touch-action: none` *after* React re-renders — that render gap is the visible "stuck for a second" moment.

Fix:

- Capture the pointer on the pressed row (`setPointerCapture`) and drive the dragged row's `transform` imperatively via a ref inside a single `requestAnimationFrame` loop — no React state per move.
- Move `touch-action: none` onto rows up front (and keep vertical scroll available until long-press fires) so activation never waits on a render.
- Track order in a ref and apply sibling shifts by writing transforms directly; commit to React state (and the store) only on release.
- Auto-scroll runs inside the same rAF loop with a direction value instead of interval churn.
- Long-press threshold stays as-is; no artificial delays are added anywhere.
- Reorder result and existing expense data are unchanged.

## Technical notes

Files touched: `android/app/src/main/java/com/skillsync/os/SkillSyncNativePlugin.java`, `android/app/src/main/res/xml/file_paths.xml`, `src/lib/native/bridge.ts`, `src/components/profile/BackupSection.tsx`, `src/lib/backup.ts`, `src/components/layout/backgrounds/shared.ts`, `src/components/layout/backgrounds/index.tsx`, `src/hooks/use-theme.tsx`, `src/routes/profile.index.tsx`, `src/lib/schema.ts`, `src/lib/migrations.ts`, `src/store/useAppStore.ts`, `src/routes/expenses.index.tsx`.

Verification: browser-drive the Expenses page to confirm drag follows the pointer with no stall, switch Background to Minimalist Light and back to confirm both appearances and persistence, open both backup info sheets, and exercise Save/Share through the web fallbacks (native paths verified by build + code review, since the APK can't run here).
