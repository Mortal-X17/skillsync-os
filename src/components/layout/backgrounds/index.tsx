import { useAppStore } from "@/store/useAppStore";
import { useResolvedTheme } from "@/hooks/use-theme";
import { AuroraBackground } from "./AuroraBackground";
import { MinimalGradientBackground } from "./MinimalGradientBackground";
import { AtmosphericBackground } from "./AtmosphericBackground";
import { LightAtmosphereBackground } from "./LightAtmosphereBackground";
import type { BackgroundStyle } from "./shared";

export { BACKGROUND_OPTIONS } from "./shared";
export type { BackgroundStyle } from "./shared";
export {
  AuroraBackground,
  MinimalGradientBackground,
  AtmosphericBackground,
  LightAtmosphereBackground,
};

export function BackgroundByStyle({ style }: { style: BackgroundStyle }) {
  if (style === "light") return <LightAtmosphereBackground />;
  if (style === "gradient") return <MinimalGradientBackground />;
  if (style === "atmospheric") return <AtmosphericBackground />;
  return <AuroraBackground />;
}

/**
 * Renders the background chosen in Profile → Preferences → Background — the
 * single source of truth for the app's appearance. "Minimalist Light" swaps in
 * the restrained light atmosphere instead of the dark aurora curtain.
 */
export function AppBackground() {
  const style = useAppStore((s) => s.preferences.background) ?? "aurora";
  return <BackgroundByStyle style={style} />;
}
