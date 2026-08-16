import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { nativeSetTheme } from "@/lib/native/bridge";

/**
 * SkillSync owns its appearance. The Android/OS colour scheme is intentionally
 * NOT consulted — the only source of truth is the persisted Theme preference.
 */
export type ThemeMode = "light" | "dark";
export type ResolvedTheme = ThemeMode;

export const THEME_OPTIONS: {
  id: ThemeMode;
  label: string;
  description: string;
  swatch: string;
}[] = [
  {
    id: "dark",
    label: "Dark",
    description: "Deep space with the animated aurora and glass surfaces.",
    swatch:
      "radial-gradient(70% 70% at 25% 20%, rgba(139,92,246,0.35), transparent 70%), radial-gradient(70% 70% at 80% 80%, rgba(37,99,235,0.3), transparent 70%), #09090b",
  },
  {
    id: "light",
    label: "Light",
    description: "Warm off-white, crisp surfaces, calm indigo atmosphere.",
    swatch:
      "radial-gradient(70% 70% at 20% 0%, rgba(99,102,241,0.18), transparent 68%), radial-gradient(60% 60% at 90% 100%, rgba(167,139,250,0.16), transparent 70%), #fbfaf8",
  },
];

const THEME_COLOR: Record<ResolvedTheme, string> = {
  dark: "#070b19",
  light: "#fbfaf8",
};

/** Normalises legacy/unknown values (including the removed "system" mode). */
export function resolveTheme(mode: string | undefined): ResolvedTheme {
  return mode === "light" ? "light" : "dark";
}

let transitionTimer: number | undefined;

function applyTheme(resolved: ResolvedTheme, animate: boolean) {
  const root = document.documentElement;
  if (root.classList.contains(resolved)) return;

  if (animate) {
    root.classList.add("theme-transition");
    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(
      () => root.classList.remove("theme-transition"),
      320,
    );
  }
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[resolved]);
}

/**
 * Applies the persisted theme preference to <html> and mirrors it onto the
 * Android system bars. No system-preference listener: the OS never flips the
 * app's theme.
 */
export function useTheme(): ResolvedTheme {
  const stored = useAppStore((s) => s.preferences.theme);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const resolved = resolveTheme(stored);

  // One-time normalisation of the removed "system" mode into an explicit
  // choice, so the OS can never influence the app again.
  useEffect(() => {
    if (stored !== "light" && stored !== "dark") {
      updatePreferences({ theme: resolved });
    }
  }, [stored, resolved, updatePreferences]);

  useEffect(() => {
    applyTheme(resolved, true);
    void nativeSetTheme(resolved, THEME_COLOR[resolved]);
  }, [resolved]);

  return resolved;
}

/** Read-only resolved theme for components that need to branch visually. */
export function useResolvedTheme(): ResolvedTheme {
  return resolveTheme(useAppStore((s) => s.preferences.theme));
}

export function ThemeManager() {
  useTheme();
  return null;
}
