# Notifications for SkillSync OS — analysis and plan

## Step 1 — What the project is today

Verified by reading the project files:

- **App type:** a TanStack Start web app with SSR disabled (`ssr: false` in `src/routes/__root.tsx`), plus a valid installable manifest (`public/manifest.webmanifest`, `display: standalone`, icons, theme color) and Capacitor config (`capacitor.config.ts`, `com.skillsync.os`, `webDir: .output/public`). So: **installable web app (manifest-only PWA) that is Capacitor-ready**, not yet a hybrid build.
- **Service workers:** none. `public/` contains only `favicon.ico`, `icon-512.png`, `manifest.webmanifest`, `robots.txt`. No `sw.js`, no `vite-plugin-pwa`, no Workbox, no registration code anywhere in `src/`.
- **Browser notification APIs:** available in the browser (`Notification`, `Notification.requestPermission`). Nothing in the codebase uses them yet — the only "notifications" reference is a boolean toggle in `preferences.notifications` (`src/lib/schema.ts`) rendered in `src/routes/profile.index.tsx`. It currently does nothing.
- **Local notifications:** yes, while a tab is open — `new Notification(...)` after permission is granted. On Android Chrome, notifications must be shown through a service worker registration (`registration.showNotification`), so a service worker is required for reliable Android display.
- **Scheduled notifications:** only while the app is open (timers). There is no reliable web API to schedule a notification for later; the Notification Triggers API was never shipped.
- **Background execution:** effectively no. Periodic Background Sync is Chrome-only, requires an installed PWA, a high site-engagement score, and its minimum interval is hours — it cannot fire an exact 9:00 PM reminder.
- **Push notifications:** technically possible with Web Push (VAPID) but requires a server to send them. Out of scope: no cloud infrastructure, no external services.
- **After the browser is closed:** web notifications will **not** fire without a push server. Locally scheduled ones die with the page.
- **Installed as a PWA:** better — the notification looks native, has an app icon, survives the tab being closed *while the OS keeps the SW alive* — but still no guaranteed exact scheduling.
- **After Capacitor conversion:** this is the real answer. `@capacitor/local-notifications` gives OS-level scheduled, recurring, exact, offline local notifications that survive app close and reboot, with actions and channels. No server.
- **Storage:** yes. Today the app persists through Zustand `persist` + localStorage with Zod schemas and a versioned `migrate()` (`src/lib/migrations.ts`, currently schema v3). Notification settings and history fit this exact pattern; no IndexedDB needed at this data size.

**Verdict:** notifications fit the architecture, and should be built as one internal engine with swappable delivery adapters (web now, Capacitor later). Full in-app value on day one; true background reminders arrive with the APK.

## Step 2 — Limitations, plainly

- **Browser:** permission must come from a user gesture; a denied permission cannot be re-requested from code — the user must reset it in site settings.
- **Android/Chrome:** notifications need a service worker to display; Android 13+ adds an OS-level notification permission on top of the web permission.
- **PWA:** no exact scheduling API. Background wake-ups (Periodic Sync) are best-effort, hours-granular, Chrome-only, and gated on engagement.
- **Service worker:** cannot run continuously, gets killed within seconds of idling, and cannot keep a timer alive.
- **Battery optimization:** Android Doze/App Standby and OEM aggressive killers (Xiaomi, Samsung, OnePlus) can delay or suppress background work. Native local notifications go through AlarmManager and are far more reliable, but users may still need to allow "Alarms & reminders" / disable battery optimization.
- **Permissions:** three separate gates eventually — web Notification permission, Android OS notification permission, and exact-alarm permission for native scheduling.

Honest summary: in the browser, reminders are reliable **only while SkillSync is open**. Everything else (notification center, history, categories, settings, digests-on-open) is fully reliable offline today.

## Step 3 — Phased roadmap

**Phase 1 — foundation (this build)**
- Permission manager with a clear, honest state machine: unsupported / default / granted / denied.
- Notification settings page with a master switch, per-category toggles, quiet hours, and reminder times.
- Notification categories: Learn, Habits, Attendance, Planner, Projects, Expenses, Backup, Achievements, Weekly summary — with module-gated categories (Attendance/Expenses only when those modules are enabled).
- Notification center: bell entry point with unread badge, grouped list, mark-read / mark-all-read, clear, tap-to-navigate.
- In-app scheduler that runs while the app is open, plus a catch-up pass on launch so due reminders appear in the center even if the app was closed.
- Data layer, migrations, backup/restore integration.

**Phase 2 — smarter scheduling**
- Recurring rules (daily / weekdays / weekly / monthly), snooze, dedupe per day.
- Rule generators: habit not checked in, attendance below minimum, planner tasks due, stale project, roadmap inactivity, backup overdue, XP/streak achievements.
- Weekly summary digest.

**Phase 3 — APK / native**
- Capacitor `LocalNotifications` adapter behind the same interface: real OS scheduling, channels, action buttons, deep links, reboot persistence, exact-alarm and battery-optimization onboarding.
- Optional guarded service worker for installed-PWA display.

## Step 4/5/6 — Foundation implementation (data + UI)

### Data structure (Zod, schema v4, additive migration)

```text
notifications: {
  settings: {
    enabled: boolean
    permission: "default" | "granted" | "denied" | "unsupported"   // mirror, source of truth is the OS
    categories: Record<CategoryKey, { enabled: boolean; time?: "HH:mm" }>
    quietHours: { enabled: boolean; from: "HH:mm"; to: "HH:mm" }
    weeklySummary: { enabled: boolean; weekday: 0-6; time: "HH:mm" }
    lastRunAt: number            // catch-up anchor
  }
  items: NotificationItem[]      // history / notification center, capped (e.g. 200, newest first)
  scheduled: ScheduledNotification[]
}

NotificationItem {
  id, createdAt, category, title, body,
  read: boolean,
  priority: "low" | "normal" | "high",
  action?: { kind: "route"; to: string; params?: Record<string,string> },
  icon?: string,               // lucide icon name
  sourceId?: string,           // dedupe key, e.g. "habit:sleep:2026-08-03"
  delivered?: boolean          // whether an OS notification was actually shown
}

ScheduledNotification {
  id, category, title, body, dueAt: number,
  recurrence?: { kind: "daily" | "weekly" | "monthly" | "weekdays"; time: "HH:mm"; weekday?: number },
  action?, priority?, sourceId?,
  nativeId?: number,           // Capacitor LocalNotifications id, Phase 3
  status: "pending" | "fired" | "cancelled"
}
```

`CategoryKey = learn | habits | attendance | planner | projects | expenses | backup | achievements | weeklySummary`.
Room for AI-driven notifications later without a schema break: an optional `origin: "rule" | "manual" | "ai"` plus `meta?: Record<string, unknown>` on both records.

### Files

- `src/lib/notifications/types.ts` — Zod schemas + types, category metadata (label, icon, description, module gate).
- `src/lib/notifications/permission.ts` — feature detection, `requestPermission()`, state reporting; no side effects at module scope.
- `src/lib/notifications/adapter.ts` — delivery interface (`show`, `schedule`, `cancel`) with a web adapter now and a documented seam for the Capacitor adapter.
- `src/lib/notifications/engine.ts` — pure helpers: due-check, quiet-hours suppression, dedupe by `sourceId`, next-occurrence computation.
- `src/hooks/use-notification-runner.tsx` — client-only tick (on mount, on focus, and a low-frequency interval) that runs the engine, pushes items into the store, and calls the adapter when permission is granted.
- `src/store/useAppStore.ts` — notification slice actions: `pushNotification`, `markRead`, `markAllRead`, `clearNotifications`, `updateNotificationSettings`, `scheduleNotification`, `cancelScheduled`.
- `src/lib/schema.ts` + `src/lib/migrations.ts` — schema v4 with a defaulting migration so existing saved data is untouched.
- `src/routes/notifications.tsx` — the notification center (grouped Today / Earlier, unread badge, tap-to-navigate, mark all read, clear).
- `src/routes/profile.notifications.tsx` — settings page: permission card with honest status copy, master switch, per-category rows with time pickers, quiet hours, weekly summary.
- `src/components/layout/AppShell.tsx` / Dashboard header — bell button with unread count.
- `src/routes/profile.index.tsx` — existing dead `Notifications` toggle becomes a link into the new settings page.
- `src/lib/backup.ts` — include notification settings and history in export/restore.

### Technical notes

- No new dependencies, no cloud, no service worker in this phase (keeps Lovable preview safe); everything stays offline and local-first.
- No `Date.now()` or random IDs at module scope — the existing SSR-crash rule from earlier work is preserved; all generation happens inside store actions and client effects.
- History is capped and stored in the existing localStorage-persisted state; the runner does bounded work on a slow tick, so there is no perceptible cost.
- Existing UI language, sheets, fields, and the current dark premium look are reused as-is — no redesign.
