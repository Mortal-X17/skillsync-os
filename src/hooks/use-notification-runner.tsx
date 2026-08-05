import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getLastBackupMeta } from "@/lib/backup";
import { buildDueCandidates, isQuietHours } from "@/lib/notifications/engine";
import { getAdapter } from "@/lib/notifications/adapter";
import { getPermission } from "@/lib/notifications/permission";
import { ensureNotificationWorker } from "@/lib/notifications/sw";
import type { AppData } from "@/lib/schema";

const TICK_MS = 60_000;


/**
 * Client-only notification runner.
 *
 * Runs the rule engine on mount (catch-up), whenever the tab regains focus,
 * and on a slow interval while the app is open. Everything is idempotent via
 * `sourceId`, so repeated runs never duplicate a notification.
 */
export function useNotificationRunner() {
  const hydrated = useAppStore((s) => s._hydrated);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    let disposed = false;

    const run = () => {
      if (disposed) return;
      const state = useAppStore.getState();
      const settings = state.notifications?.settings;
      if (!settings) return;

      // Keep the mirrored permission value honest.
      const permission = getPermission();
      if (permission !== settings.permission) {
        state.updateNotificationSettings({ permission });
      }

      const now = new Date();
      const data = state as unknown as AppData;
      const candidates = buildDueCandidates(
        data,
        settings,
        now,
        getLastBackupMeta()?.createdAt ?? null,
      );

      const quiet = isQuietHours(settings, now);
      const adapter = getAdapter();
      const canDeliver =
        settings.enabled && permission === "granted" && !quiet;

      for (const candidate of candidates) {
        const item = state.pushNotification(candidate);
        if (!item) continue;
        if (canDeliver) {
          void adapter.show(item).then((ok) => {
            if (ok) {
              useAppStore.setState((s) => ({
                notifications: {
                  ...s.notifications,
                  items: s.notifications.items.map((i) =>
                    i.id === item.id ? { ...i, delivered: true } : i,
                  ),
                },
              }));
            }
          });
        }
      }

      state.updateNotificationSettings({ lastRunAt: Date.now() });
    };

    run();
    const interval = window.setInterval(run, TICK_MS);
    const onFocus = () => run();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [hydrated]);
}

/** Unread count for the bell badge. */
export function useUnreadCount() {
  return useAppStore((s) => (s.notifications?.items ?? []).filter((i) => !i.read).length);
}
