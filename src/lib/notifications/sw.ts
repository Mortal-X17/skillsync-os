/**
 * Registration + diagnostics for the display-only notification worker.
 *
 * Why this exists: on Android Chrome (and every installed PWA on Android)
 * `new Notification(...)` throws
 *   TypeError: Failed to construct 'Notification': Illegal constructor.
 *   Use ServiceWorkerRegistration.showNotification() instead.
 * so a service worker registration is mandatory for a notification to display.
 *
 * This worker never handles fetch and never caches, so it cannot make the
 * Lovable preview or a deploy serve stale content.
 */

const SW_URL = "/notifications-sw.js";

export type NotificationEnvironment = {
  secureContext: boolean;
  standalone: boolean;
  notificationApi: boolean;
  serviceWorkerApi: boolean;
  swRegistered: boolean;
  swActive: boolean;
  swInstalling: boolean;
  swWaiting: boolean;
  swControlling: boolean;
  scope: string | null;
  constructorUsable: boolean;
  visibility: string | null;
  error: string | null;
};

let registration: ServiceWorkerRegistration | null = null;
let pending: Promise<ServiceWorkerRegistration | null> | null = null;

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
  return (
    Boolean(iosStandalone) ||
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: fullscreen)").matches ||
    window.matchMedia?.("(display-mode: minimal-ui)").matches ||
    false
  );
}

/** Idempotent registration. Safe to call on every mount. */
export function ensureNotificationWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (registration) return Promise.resolve(registration);
  if (!("serviceWorker" in navigator) || !window.isSecureContext) {
    return Promise.resolve(null);
  }
  if (pending) return pending;

  pending = navigator.serviceWorker
    .register(SW_URL, { scope: "/" })
    .then(async (reg) => {
      registration = reg;
      if (!reg.active) {
        // Wait briefly so the first delivery after a cold start can use it.
        await navigator.serviceWorker.ready.catch(() => null);
      }
      return reg;
    })
    .catch((err) => {
      console.warn("[notifications] worker registration failed", err);
      return null;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

export async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (registration) return registration;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration(SW_URL).catch(() => null);
  if (existing) registration = existing;
  return registration ?? (await ensureNotificationWorker());
}

/** Full environment snapshot used by the settings diagnostics card. */
export async function inspectEnvironment(): Promise<NotificationEnvironment> {
  if (typeof window === "undefined") {
    return {
      secureContext: false,
      standalone: false,
      notificationApi: false,
      serviceWorkerApi: false,
      swRegistered: false,
      swActive: false,
      swInstalling: false,
      swWaiting: false,
      swControlling: false,
      scope: null,
      constructorUsable: false,
      visibility: null,
      error: null,
    };
  }

  let error: string | null = null;
  let reg: ServiceWorkerRegistration | null = null;
  try {
    reg = await getRegistration();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  // Feature-detect the constructor without actually showing anything.
  let constructorUsable = false;
  if ("Notification" in window) {
    try {
      constructorUsable = typeof window.Notification === "function";
      // Android Chrome exposes the constructor but throws on construction.
      if (constructorUsable && /Android/i.test(navigator.userAgent)) {
        constructorUsable = false;
      }
    } catch {
      constructorUsable = false;
    }
  }

  return {
    secureContext: window.isSecureContext,
    standalone: isStandalone(),
    notificationApi: "Notification" in window,
    serviceWorkerApi: "serviceWorker" in navigator,
    swRegistered: Boolean(reg),
    swActive: Boolean(reg?.active),
    swInstalling: Boolean(reg?.installing),
    swWaiting: Boolean(reg?.waiting),
    swControlling: Boolean(navigator.serviceWorker?.controller),
    scope: reg?.scope ?? null,
    constructorUsable,
    visibility: document.visibilityState,
    error,
  };
}
