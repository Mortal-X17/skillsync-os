/**
 * Access to the SkillSync Android native bridge (`SkillSyncNativePlugin`).
 *
 * Everything here is runtime-only and defensive: on the web the plugin simply
 * does not exist, every call returns a "not available" result, and callers fall
 * back to browser APIs. No Capacitor module is imported, so the web bundle is
 * unaffected.
 */

export type NativeCapabilities = {
  native: boolean;
  platform: string;
  sdk: number;
  haptics: boolean;
  amplitudeControl: boolean;
  canSchedule: boolean;
  exactAlarms: boolean;
  notificationsEnabled: boolean;
  permission: "default" | "granted" | "denied";
  scheduledCount: number;
};

export type NativeRepeat = "none" | "daily" | "weekdays" | "weekly" | "monthly";

type NativePlugin = {
  capabilities(): Promise<NativeCapabilities>;
  vibrate(o: { duration: number; amplitude?: number }): Promise<{ ok: boolean }>;
  vibratePattern(o: { pattern: number[] }): Promise<{ ok: boolean }>;
  haptic(o: { level: string }): Promise<{ ok: boolean }>;
  checkNotificationPermission(): Promise<{ permission: "default" | "granted" | "denied" }>;
  requestNotificationPermission(): Promise<{ permission: "default" | "granted" | "denied" }>;
  notify(o: {
    id?: string;
    title: string;
    body?: string;
    url?: string;
    priority?: string;
  }): Promise<{ ok: boolean }>;
  schedule(o: {
    id: string;
    title: string;
    body?: string;
    at: number;
    repeat?: NativeRepeat;
    url?: string;
    priority?: string;
  }): Promise<{ ok: boolean; id: string; at: number; exact: boolean }>;
  cancel(o: { id: string }): Promise<{ ok: boolean }>;
  cancelAll(): Promise<{ ok: boolean }>;
  listScheduled(): Promise<{ scheduled: unknown[] }>;
  takePendingRoute(): Promise<{ route: string | null }>;
};

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: Record<string, unknown>;
};

function capacitor(): CapacitorGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
}

/** True inside the Capacitor Android/iOS shell. */
export function isNativeShell(): boolean {
  return Boolean(capacitor()?.isNativePlatform?.());
}

export function nativePlatform(): string {
  return capacitor()?.getPlatform?.() ?? "web";
}

/** The plugin, or null when running in a browser. */
export function nativeBridge(): NativePlugin | null {
  const cap = capacitor();
  if (!cap?.isNativePlatform?.()) return null;
  const plugin = cap.Plugins?.["SkillSyncNative"];
  return plugin ? (plugin as NativePlugin) : null;
}

export function hasNativeBridge(): boolean {
  return nativeBridge() !== null;
}

let cached: NativeCapabilities | null = null;

/** Cached capability probe; returns null on the web. */
export async function nativeCapabilities(
  refresh = false,
): Promise<NativeCapabilities | null> {
  const bridge = nativeBridge();
  if (!bridge) return null;
  if (cached && !refresh) return cached;
  try {
    cached = await bridge.capabilities();
    return cached;
  } catch {
    return null;
  }
}
