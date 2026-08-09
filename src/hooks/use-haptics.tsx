import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { configureHaptics, type HapticIntensity } from "@/lib/haptics";

/**
 * Mirrors the persisted haptic preferences into the haptic service.
 * Mounted once by the app shell — components never configure haptics themselves.
 */
export function useHapticPreferences() {
  const enabled = useAppStore((s) => s.preferences.haptics ?? true);
  const intensity = useAppStore(
    (s) => (s.preferences.hapticIntensity ?? "standard") as HapticIntensity,
  );

  useEffect(() => {
    configureHaptics({ enabled, intensity });
  }, [enabled, intensity]);
}
