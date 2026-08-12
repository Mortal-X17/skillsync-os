import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_OPTIONS: {
  id: ThemeMode;
  label: string;
  description: string;
  swatch: string;
}[] = [
  {
    id: "dark",
    label: "Dark",
    description: "Deep charcoal with purple → blue accents.",
    swatch:
      "radial-gradient(70% 70% at 25% 20%, rgba(139,92,246,0.35), transparent 70%), radial-gradient(70% 70% at 80% 80%, rgba(37,99,235,0.3), transparent 70%), #09090b",
  },
  {
    id: "light",
    label: "Light",
    description: "White and silver with indigo → violet accents.",
    swatch:
      "radial-gradient(70% 70% at 25% 20%, rgba(99,102,241,0.28), transparent 70%), radial-gradient(70% 70% at 80% 80%, rgba(167,139,250,0.28), transparent 70%), #f8f9fc",
  },
  {
    id: "system",
    label: "System",
    description: "Follow your device appearance automatically.",
    swatch:
      "linear-gradient(120deg, #09090b 0%, #09090b 48%, #f8f9fc 52%, #f8f9fc 100%)",
  },
];

const THEME_COLOR: Record<ResolvedTheme, string> = {
  dark: "#070b19",
  light: "#f8f9fc",
};

function systemPrefersDark() {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
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
 * Applies the persisted theme preference to <html>, tracks the system
 * preference when the mode is "system", and animates theme changes.
 */
export function useTheme() {
  const mode = (useAppStore((s) => s.preferences.theme) ?? "dark") as ThemeMode;

  useEffect(() => {
    applyTheme(resolveTheme(mode), true);
    if (mode !== "system" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(mq.matches ? "dark" : "light", true);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  return mode;
}

export function ThemeManager() {
  useTheme();
  return null;
}
