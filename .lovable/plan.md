# SkillSync OS — Opening Experience & Logo System

## What changes

### 1. One canonical logo (symbol only)
Rewrite `src/components/brand/SkillSyncLogo.tsx` so it renders the new S-mark from the reference: two flowing ribbon halves forming an S, purple → blue → cyan gradient, soft luminous edge, transparent background, no text, no tagline. Pure inline SVG (vector, scales to any size, no network request).

The current version (rings + a text "S") is replaced in place, so there stays exactly one source of truth. Each SVG gradient/filter gets a unique id per instance so multiple sizes on one page can't collide.

### 2. Logo usage audit
Reuse the same component everywhere the SkillSync brand mark appears, at context-appropriate sizes:
- Opening sequence (large)
- Desktop sidebar header in `SideNav.tsx` — currently a text-only "SkillSync" wordmark, gets the mark next to it
- Favicon / web app icon: generate a square PNG of the mark, write to `public/favicon.png` + `public/icon-512.png` (manifest already points at icon-512), update the `icon` link in `__root.tsx`, delete `public/favicon.ico`
- Android launcher: replace `ic_launcher_foreground` across mipmap densities with the mark, and set the adaptive-icon background to the deep matte base

Unrelated feature icons (lucide icons in nav/cards) are untouched.

### 3. Opening experience
Replace the internals of `src/components/layout/AppLaunchScreen.tsx` with a `SplashSequence`-style staged component (same file/mount point, so the existing "plays once per document load" guard, root mounting, and Android back behavior are all preserved).

Stages, all CSS keyframes on a fixed small set of elements:

```text
0.00–0.25  ORIGIN     tiny luminous point fades/scales in
0.25–0.55  PULSE      one soft expanding ring, opacity+scale only
0.55–1.15  ORBIT      thin gradient ring stroke draws around center (dash offset), rotating
1.15–1.70  SWIRL      ring splits into the two logo ribbon paths (stroke-dash draw + rotate)
1.70–2.10  LOGO FORM  ribbons fill in, mark scales 0.9→1.02→1 (gentle overshoot)
2.10–2.40  BLOOM      single radial glow blooms then settles to ambient
2.40–2.80  BRAND      "SKILLSYNC OS" fades + rises beneath the mark
2.80–3.20  TAGLINE    "ALIGN • CONNECT • ELEVATE" fades + rises, smaller/dimmer
3.20–3.70  HOLD       final frame holds
3.70–4.10  EXIT       whole layer fades with a 1.02 scale into the Dashboard
```

Total ≈ 4.1s ceiling. The existing readiness logic stays: the sequence runs its timeline while the app hydrates in parallel, an absolute 4s-ish safety cap still force-dismisses, and it never becomes a loading screen. Dashboard sits underneath already-rendered, so the exit is a fade over live content — no white flash, no black frame, no page swap.

Typography: brand name and tagline are separate DOM text nodes using the existing Inter stack and tokens (letter-spaced uppercase, gradient on "OS" as today); tagline uses muted foreground and smaller tracking-wide type.

### 4. Replay rules (unchanged behavior, documented)
Module-scope `launchPlayed` flag stays: plays on cold launch / APK start / hard reload only. Never on tab switches, route navigation, back navigation, modals, theme changes, or returning from background.

### 5. Reduced motion
`prefers-reduced-motion: reduce` → skip origin/pulse/orbit/swirl entirely; show the final composition (mark + name + tagline) with a ~250ms fade, hold ~300ms, fade out. Brand identity preserved, no orbital motion.

### 6. Performance
- Only opacity / transform / SVG stroke-dash animations; no width/height/top/left.
- Fixed element count (under ~12 nodes), no particles, no canvas, no rAF loop, no React state driving frames — React state changes only twice (mount, leave).
- One blurred radial glow, no backdrop-filter, no large box-shadow stacks.
- `will-change` set only during the sequence; whole layer unmounts afterwards so nothing lingers.
- Layer is `pointer-events-none`, so it can't swallow input.

### 7. Responsive
Centered flex column with viewport-relative mark sizing (clamped, e.g. `min(38vw, 148px)`), fluid type steps, `100dvh` and safe-area padding. Works from small phones to large phones and desktop.

## Out of scope
Dashboard, Notes, Projects, Planner, Learn, Profile, data layer, notifications, navigation and Android back handling are not modified.

## Verification
Build the project, then drive the preview with Playwright to capture frames of the sequence and confirm the Dashboard is interactive after it ends, plus a reduced-motion run. Findings reported honestly.
