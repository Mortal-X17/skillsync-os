import type {
  NotificationItem,
  ScheduledNotification,
} from "./types";
import { getPermission } from "./permission";

/**
 * Delivery adapter interface. The web adapter shows notifications while the
 * app is open. The Capacitor adapter (Phase 3) implements the same surface
 * with @capacitor/local-notifications, giving real OS-level scheduling.
 */
export type NotificationAdapter = {
  readonly kind: "web" | "capacitor" | "noop";
  /** Whether real OS scheduling (background, app closed) is available. */
  readonly canSchedule: boolean;
  show(item: NotificationItem): Promise<boolean>;
  schedule(entry: ScheduledNotification): Promise<number | null>;
  cancel(entry: ScheduledNotification): Promise<void>;
};

const webAdapter: NotificationAdapter = {
  kind: "web",
  canSchedule: false,
  async show(item) {
    if (getPermission() !== "granted") return false;
    try {
      new window.Notification(item.title, {
        body: item.body,
        icon: "/icon-512.png",
        badge: "/icon-512.png",
        tag: item.sourceId ?? item.id,
        silent: item.priority === "low",
      });
      return true;
    } catch {
      return false;
    }
  },
  // The web platform has no reliable "fire later" API — scheduling is handled
  // in-app by the runner while SkillSync is open.
  async schedule() {
    return null;
  },
  async cancel() {},
};

const noopAdapter: NotificationAdapter = {
  kind: "noop",
  canSchedule: false,
  async show() {
    return false;
  },
  async schedule() {
    return null;
  },
  async cancel() {},
};

/**
 * Phase 3 seam: when running inside the Capacitor shell, swap in a native
 * adapter here. Detection stays runtime-only so the web build never imports
 * native plugins.
 */
export function getAdapter(): NotificationAdapter {
  if (typeof window === "undefined") return noopAdapter;
  return webAdapter;
}

export function isNativeShell(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}
