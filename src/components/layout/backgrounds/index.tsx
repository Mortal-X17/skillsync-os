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
  if (style === "gradient") return <MinimalGradientBackground />;
  if (style === "atmospheric") return <AtmosphericBackground />;
  return <AuroraBackground />;
}

/**
 * Renders the background chosen in Profile → Preferences → Appearance.
 * The Light theme has its own restrained atmosphere instead of the dark
 * northern-lights curtain.
 */
export function AppBackground() {
  const style = useAppStore((s) => s.preferences.background) ?? "aurora";
  const theme = useResolvedTheme();
  if (theme === "light" && style === "aurora") return <LightAtmosphereBackground />;
  return <BackgroundByStyle style={style} />;
}
