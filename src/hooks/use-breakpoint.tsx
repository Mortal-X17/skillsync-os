import { useEffect, useState } from "react";

/** Tailwind-aligned breakpoints (px). */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** True from the `lg` breakpoint up — sidebar / desktop behaviour. */
export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
}

/** True from `md` up — dialog-style overlays instead of bottom sheets. */
export function useIsTabletUp() {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
}

/** True for pointer devices with hover (desktop-only affordances). */
export function useHasHover() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
