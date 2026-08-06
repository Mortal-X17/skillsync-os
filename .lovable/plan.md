# SkillSync OS — Future Architecture Analysis

Analysis only. No code changes proposed for this turn.

## What the code actually shows today

- TanStack Start + React 19 + Vite 8, Tailwind v4, shadcn/Radix UI, Zustand, Zod, recharts, sonner.
- Single source of truth: one Zustand store (`src/store/useAppStore.ts`, ~980 lines) persisted to `localStorage` via `persist` + `createJSONStorage`, `version: 4`, with a hand-written `migrate()` in `src/lib/migrations.ts`.
- Schema fully typed in `src/lib/schema.ts` (roadmaps, notes, projects, planner, habits, attendance, expenses, notifications, prefs, stats).
- SSR is effectively disabled at the root (`ssr: false`), so it already behaves like a client-rendered SPA — this is what makes packaging as a native shell easy.
- Capacitor is already installed (`@capacitor/android`, `core`, `cli` v8) and `capacitor.config.ts` exists with `appId: com.skillsync.os`, `webDir: .output/public`.
- One display-only service worker (`public/notifications-sw.js`) — no fetch handler, no caching. Manifest exists at `public/manifest.webmanifest`.
- No backend: no `src/routes/api/*`, no Supabase, no auth, no network calls.
- Lovable-specific surface is tiny: `@lovable.dev/vite-tanstack-config` (dev dep), `src/lib/lovable-error-reporting.ts`, one import in `__root.tsx`, and `bunfig.toml`.

---

## Q1 — Can it become a real Android app?

**Yes, and it is the shortest path of everything in this document.** Capacitor is already a dependency and configured; nothing in the codebase blocks it (no SSR dependency, no server calls, all state local).

Steps: `bun run build` → `bunx cap add android` → `bunx cap sync android` → build APK/AAB in Android Studio or `./gradlew`. `scripts/android-setup.md` already documents this.

Required: Android Studio (for the SDK, Java, Gradle and signing) — unavoidable for a real store build. Signing keystore must be created once and kept forever.

Native capability verdicts:

| Capability | Verdict | How |
| --- | --- | --- |
| Local notifications | Yes — big reliability win | `@capacitor/local-notifications` fires when the app is closed; today's web path only works while the tab is open. The adapter seam in `src/lib/notifications/adapter.ts` was written for exactly this swap (`kind: "capacitor"`). |
| Real file system | Yes | `@capacitor/filesystem` — proper backup/restore to Downloads instead of browser download blobs. |
| Biometric auth | Yes | community `capacitor-native-biometric`; gates the app locally, no server needed. |
| Background tasks | Partial | `@capacitor/background-runner` or a custom plugin. Android battery optimisation still throttles; treat as best-effort, never as a guarantee. |
| Home-screen widgets | Yes, but native code | Requires a Kotlin app-widget provider + a bridge plugin. Not writable in TypeScript. Highest effort item. |
| Bluetooth | Yes | `@capacitor-community/bluetooth-le`. |
| Nearby sync | Yes, with custom work | BLE or Nearby Connections via a custom plugin, plus a conflict-resolution layer the data model does not have yet. |

Advantages: reliable notifications, Play Store distribution, app icon/splash, native storage, no browser chrome.
Disadvantages: a second build pipeline, Play Store policy + signing overhead, native code for widgets, updates require a store release (or Capacitor live-update).
Difficulty: basic APK **low** (a day). Notifications + filesystem + biometrics **low-medium**. Widgets and nearby sync **high**.

## Q2 — Can it become fully independent of Lovable?

**Yes, essentially completely.** The app has no backend, no Lovable runtime, no Lovable database. Export the repo to GitHub and it builds anywhere.

Only three touchpoints to remove:
1. `@lovable.dev/vite-tanstack-config` in `vite.config.ts` — replace with a plain `vite.config.ts` declaring the same plugins (tanstackStart, react, tailwind, tsconfigPaths) and the `@` alias. This is the one real piece of work, a few hours.
2. `src/lib/lovable-error-reporting.ts` + its `__root.tsx` import — delete or repoint at Sentry. It is already a no-op outside the editor.
3. `bunfig.toml` registry line — swap to public npm.

Answers to the direct questions:
- **Lovable branding shown to users?** No. Nothing renders Lovable text or the badge in the app UI.
- **Depends on Lovable servers at runtime?** No, once hosted elsewhere. Today it only depends on Lovable for hosting the `.lovable.app` URL and for the build.
- **Does Lovable control the app?** No — you own the code; the only lock-in is the editor and the vite config preset.
- **Can it exist entirely independently?** Yes.

## Q3 — Independent hosting comparison

It is a static/edge SPA (SSR off), so every option below works.

| Host | Performance | Reliability | Cost | Maintenance | PWA fit | Scale |
| --- | --- | --- | --- | --- | --- | --- |
| Cloudflare Pages | Best (largest edge network) | Excellent | Free tier very generous | Very low | Excellent, full header control | Effectively unlimited |
| Vercel | Excellent | Excellent | Free hobby; paid grows fast | Lowest (zero-config) | Excellent | Excellent |
| Netlify | Very good | Very good | Free tier, bandwidth-capped | Very low | Excellent | Good |
| Firebase Hosting | Good | Excellent | Cheap; pairs with Firestore later | Low, CLI-driven | Good | Excellent |
| GitHub Pages | Fine (CDN, no edge logic) | Good | Free | Low | Works; no custom headers/redirect logic | Static only |

**Recommendation: Cloudflare Pages.** Best cost-to-performance, real header control (matters for service workers and manifest caching), and if a sync backend is ever added, Workers + D1 sit in the same platform. Vercel is the pick if you value zero-config over cost.

## Q4 — Can it become fully responsive?

**Yes, and the stack already supports it** — Tailwind v4 breakpoints, shadcn `sidebar.tsx` and `resizable.tsx` already in the repo, unused. Nothing is hard-coded to a phone width in a way that blocks it; the constraint is that layouts were authored mobile-first only.

Approach: keep mobile as the base, add `md:`/`lg:`/`xl:` layers — max-width containers, multi-column card grids, fluid type scale via `clamp()`, and a persistent left sidebar on `lg+` replacing the bottom nav.

Known risk points, all in presentation code:
- **Bottom nav** — must swap to a sidebar above `lg`, not stretch across a desktop viewport. Biggest single change.
- **Keyboard handling** — `use-keyboard-inset.tsx` assumes a mobile IME; must become a no-op on desktop or it will shift desktop layouts.
- **Bottom sheets** — `src/components/edit/Sheet.tsx` and `ConfirmDialog` should render as centred modals on desktop; the sheet-vs-dialog switch is the main refactor.
- **FAB** — on the Learn page it is already a header-anchored button; on desktop it should become a normal toolbar button.
- **Charts** — recharts needs `ResponsiveContainer` and re-tuned tick density at wide widths.
- **Animations** — spring/blur layers are cheap on a phone viewport; on ultrawide the aurora blobs get expensive. Cap blob size and respect `prefers-reduced-motion`.
- **Foldables** — handle via viewport-segment-agnostic fluid grids; do not chase device-specific hacks.

## Q5 — Can it become an ecosystem?

Yes, in this order of feasibility:
1. **PWA + web** — already there.
2. **Android app** — Capacitor, already wired.
3. **Desktop app** — Tauri or Electron over the same build; low effort. Tauri preferred (small binary).
4. **Widgets** — native Android code, medium-high.
5. **AI features** — feasible, but the moment you call a model you need a server and a key; that breaks pure local-first. Design it as an opt-in online feature.
6. **Cloud sync** — the biggest architectural change (see Q6).
7. **Nearby sync** — BLE/Nearby via custom plugin, only after a conflict-resolution model exists.
8. **Wearables** — last; needs a native companion surface.

## Q6 — Long-term viability of the current architecture

Honest assessment: the architecture is excellent for a single-device personal tool and **will not** carry the multi-user features as-is.

| Need | Supported today? | What it requires |
| --- | --- | --- |
| Millions of users | Yes, trivially — each user's data is on their own device, hosting is static CDN | Nothing |
| Sync | No | Per-entity `updatedAt` + tombstones, a server (Supabase/Firebase/D1), and a conflict strategy. Today only `Transaction` has `updatedAt`; deletes leave no tombstone, so a naive sync resurrects deleted rows. |
| Authentication | No | Auth provider + gating; currently zero identity concept |
| Encryption | No | localStorage is plaintext. Needs WebCrypto envelope encryption, or SQLCipher on native |
| AI features | No | Server proxy for keys |
| Large databases | **No — the real ceiling** | The whole app state is one JSON blob serialised to localStorage (~5 MB cap) on every mutation. Migrate to IndexedDB, then to SQLite on native |
| Real-time | No | Requires the sync backend first |

## Q7 — Hidden problems found

**Performance**
- Every store mutation re-serialises the entire app state to `localStorage` synchronously. Fine at today's data volumes, degrades noticeably once roadmaps/expenses grow into the thousands, and blocks the main thread during drag-reorder.
- Several route files are very large (`learn.$roadmapId.tsx` 954, `profile.index.tsx` 985, `expenses.index.tsx` 830) — they re-render broadly and are hard to memoise.
- Aurora background runs continuous large-blur animations; on low-end Android this is the top battery/jank suspect.

**Scalability**
- The 5 MB localStorage quota is a hard wall. There is no quota detection and no user-facing failure path when a write is rejected — data loss would be silent.
- One monolithic store means one migration surface; `migrations.ts` is already defensive patchwork at v4.

**Security**
- All data plaintext on device; a shared or rooted device exposes everything.
- No app lock. Backup JSON exports are unencrypted and unsigned — a tampered import file is trusted after Zod shape validation only.

**Technical debt**
- Manual `migrate()` with no migration tests; a bad migration is unrecoverable for users with no backup.
- SSR disabled at root: correct for now, but it forfeits SEO and means any future public/marketing page needs separate handling.
- `capacitor.config.ts` points at `.output/public`; the native path is configured but never exercised in CI, so it will bit-rot.

**Design/future limitations**
- Mobile-only layouts (Q4) and bottom-sheet-everywhere pattern.
- No entity-level `updatedAt`/tombstones — the single biggest blocker to ever adding sync cheaply. Adding them now is nearly free; adding them after years of user data is painful.

## Q8 — Roadmap

**Phase 1 (0–3 months) — harden and ship native**
- Build and sign the Android APK/AAB via the existing Capacitor setup.
- Swap the notification adapter to `@capacitor/local-notifications` on native (the seam exists).
- Native filesystem backup + biometric app lock.
- Add `updatedAt` to every entity and tombstones for deletes — cheap now, expensive later.
- localStorage quota detection with a visible warning + forced backup prompt.

**Phase 2 (3–6 months) — responsive and durable**
- Tablet/desktop responsive pass: sidebar above `lg`, dialog-vs-sheet switch, fluid typography, chart re-tuning.
- Migrate persistence from localStorage to IndexedDB (removes the 5 MB wall).
- Split the largest route files; add migration tests.
- Reduce background animation cost on low-end devices; honour `prefers-reduced-motion`.

**Phase 3 (6–12 months) — independence and sync foundation**
- Export to GitHub, remove the Lovable vite preset and error reporter, deploy to Cloudflare Pages with CI.
- Add optional accounts + encrypted cloud sync (local-first stays the default; sync is opt-in).
- Desktop app via Tauri from the same build.
- Optional local encryption at rest.

**Phase 4 (1–3 years) — ecosystem**
- Android home-screen widgets (native Kotlin + bridge plugin).
- Nearby/offline peer sync over BLE.
- AI layer behind a server proxy (roadmap generation, insights) as an online opt-in.
- Wearable companion; SQLite on native for large datasets.

## Bottom line

Two things are already true and easy: **a real Android app** and **full independence from Lovable**. Two things need deliberate architecture work before they are possible: **sync/multi-device** and **large datasets** — and the cheapest moment to prepare for both is now, by adding `updatedAt` + tombstones and moving off localStorage before user data grows.
