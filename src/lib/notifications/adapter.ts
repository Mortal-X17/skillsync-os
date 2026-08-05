import type {
  NotificationItem,
  ScheduledNotification,
} from "./types";
import { getPermission } from "./permission";
import { getRegistration } from "./sw";

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

/** Delivery result with the exact path taken — used by diagnostics/logs. */
export type DeliveryResult = {
  ok: boolean;
  via: "serviceWorker" | "constructor" | "none";
  error: string | null;
};

/**
 * Displays a notification, preferring the service-worker path.
 *
 * On Android Chrome `new Notification()` throws an "Illegal constructor"
 * TypeError, so registration.showNotification() is the only path that works
 * there. Desktop keeps the constructor as a fallback.
 */
export async function deliver(item: NotificationItem): Promise<DeliveryResult> {
  if (typeof window === "undefined") {
    return { ok: false, via: "none", error: "no window" };
  }
  if (getPermission() !== "granted") {
    return { ok: false, via: "none", error: "permission not granted" };
  }

  const options: NotificationOptions & { renotify?: boolean } = {
    body: item.body,
    icon: "/icon-512.png",
    badge: "/icon-512.png",
    tag: item.sourceId ?? item.id,
    silent: item.priority === "low",
    data: { url: item.action?.kind === "route" ? item.action.to : "/notifications" },
  };

  let swError: string | null = null;
  try {
    const reg = await getRegistration();
    if (reg) {
      await reg.showNotification(item.title, options);
      console.info("[notifications] displayed via service worker", item.sourceId ?? item.id);
      return { ok: true, via: "serviceWorker", error: null };
    }
    swError = "no service worker registration";
  } catch (e) {
    swError = e instanceof Error ? e.message : String(e);
  }

  try {
    new window.Notification(item.title, options);
    console.info("[notifications] displayed via constructor", item.sourceId ?? item.id);
    return { ok: true, via: "constructor", error: swError };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.warn("[notifications] delivery failed", { swError, constructorError: err });
    return { ok: false, via: "none", error: swError ? `${swError}; ${err}` : err };
  }
}

const webAdapter: NotificationAdapter = {
  kind: "web",
  canSchedule: false,
  async show(item) {
    return (await deliver(item)).ok;
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
