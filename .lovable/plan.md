## 1. Keyboard (IME) overlap fix

**Detect the keyboard** — add `src/hooks/use-keyboard-inset.tsx` using `window.visualViewport` (resize/scroll listeners) to compute `keyboardInset = innerHeight - (visualViewport.height + offsetTop)`. Treated as open when inset > 120px. SSR-safe (starts at 0, reads only in `useEffect`). Expose the value as a CSS variable `--kb-inset` on `<html>` so plain CSS can react too.

**Hide the bottom nav when the keyboard is open** — `BottomNav` gets `translate-y-[120%] opacity-0 pointer-events-none` while the keyboard is up, with a 200ms ease transition. Also auto-hide whenever a bottom sheet/dialog is open, so it can never sit over sheet content.

**Bottom sheets sit above the keyboard** — in `src/components/edit/Sheet.tsx`:
- `BottomSheet` container gets `paddingBottom: max(env(safe-area-inset-bottom), 24px) + keyboardInset` and `maxHeight: calc(92dvh - keyboardInset)` so it shrinks instead of sliding under the keyboard.
- `ConfirmDialog` container gets the same bottom offset so it re-centers in the visible area.
- Sheet body keeps its own scroll; the header/handle stay pinned.

**Sticky action row** — sheets that render Save/Done buttons get a sticky footer (`sticky bottom-0` inside the scroll area with a blurred surface backdrop), so the primary action is always visible regardless of content height.

**Auto scroll-into-view on focus** — a small `useScrollFocusedIntoView` effect inside the sheet listens to `focusin` on the sheet body and calls `scrollIntoView({ block: "center", behavior: "smooth" })` after the viewport settles (rAF + short timeout for the keyboard animation).

**Suggestion bar / credential strip** — already partly handled by `NO_AUTOFILL_PROPS`; extend it with `name="no-autofill-<random>"` fallback and audit any bare `<input>`/`<textarea>` still not using `TextField`/`TextArea` (Learn phase rename, Habit edit, Planner, Notes, Attendance, Expenses) and convert them. Gboard's own suggestion strip can't be removed by web code, but with the nav hidden and the sheet resized it no longer overlaps anything.

**Viewport meta** — `viewport-fit=cover` is already set; add `interactive-widget=resizes-content` so Android resizes rather than overlays the layout.

**QA pass** — walk every sheet/dialog/form on a 433×826 mobile viewport with a simulated keyboard inset and confirm zero overlap: Learn (rename phase/topic/subtopic, create roadmap, import), Habits (edit habit, check-in note), Projects, Planner, Notes, Attendance, Expenses, Profile (dev mode, reset phrase, backup).

## 2. Background system

**Remove the grid.** Replace `AuroraBackground.tsx` with a modular `src/components/layout/Backgrounds/` directory:
- `AuroraBackground.tsx` — Option 1: 3 huge blurred clouds (purple, indigo, royal blue + faint cyan), 3–8% opacity, 60–90s drift cycles, GPU transforms only.
- `MinimalGradient.tsx` — Option 2: static matte black, soft radial gradients, edge lighting, vignette, fine grain. Zero animation.
- `Atmospheric.tsx` — Option 3: layered corner lighting, ambient shadow falloff, deep noise texture, no visible shapes.
- `index.tsx` — `<AppBackground />` reads the chosen style from the store and renders the right layer. All three respect `prefers-reduced-motion` (aurora freezes to a static composition).

**Live in-app preview so you can compare** — a new "Appearance" tile in Profile → Preferences opens a picker sheet with three swatch cards. Tapping a card applies the background instantly to the whole app (live, full-screen), so you can back out and browse other pages while it's active; tap another to switch. The choice is persisted in `preferences.background` (default: Aurora) with a schema migration so existing data is untouched.

### Technical notes
- No new dependencies.
- `visualViewport` listeners are passive and throttled with rAF; the CSS variable write is the only DOM mutation.
- Backgrounds use `transform`/`opacity` only, `will-change` scoped, `contain: strict` on the fixed layer — no repaint cost on scroll, battery-safe.
- Zustand persist version bumped with a defaulting migration for `preferences.background`.
