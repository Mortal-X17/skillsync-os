/**
 * Notification permission handling. No side effects at module scope —
 * everything is read lazily inside functions so SSR/prerender is safe.
 */

export type PermissionState = "default" | "granted" | "denied" | "unsupported";

export function isSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getPermission(): PermissionState {
  if (!isSupported()) return "unsupported";
  const p = window.Notification.permission;
  if (p === "granted" || p === "denied") return p;
  return "default";
}

/** Must be called from a user gesture. */
export async function requestPermission(): Promise<PermissionState> {
  if (!isSupported()) return "unsupported";
  try {
    const result = await window.Notification.requestPermission();
    if (result === "granted" || result === "denied") return result;
    return "default";
  } catch {
    return getPermission();
  }
}

export const PERMISSION_COPY: Record<
  PermissionState,
  { title: string; body: string }
> = {
  unsupported: {
    title: "Not supported on this device",
    body: "This browser can't show system notifications. SkillSync still collects every reminder in your in-app notification center.",
  },
  default: {
    title: "System notifications are off",
    body: "Allow notifications so reminders can appear outside the app while SkillSync is open.",
  },
  granted: {
    title: "System notifications allowed",
    body: "Reminders appear while SkillSync is open. Install the app or use the Android build for reminders that fire in the background.",
  },
  denied: {
    title: "System notifications blocked",
    body: "You blocked notifications for SkillSync. Re-enable them in your browser's site settings — this can't be re-requested from inside the app.",
  },
};
