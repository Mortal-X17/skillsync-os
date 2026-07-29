import { useAppStore } from "@/store/useAppStore";
import { AuroraBackground } from "./AuroraBackground";
import { MinimalGradientBackground } from "./MinimalGradientBackground";
import { AtmosphericBackground } from "./AtmosphericBackground";
import type { BackgroundStyle } from "./shared";

export { BACKGROUND_OPTIONS } from "./shared";
export type { BackgroundStyle } from "./shared";
export { AuroraBackground, MinimalGradientBackground, AtmosphericBackground };

export function BackgroundByStyle({ style }: { style: BackgroundStyle }) {
  if (style === "gradient") return <MinimalGradientBackground />;
  if (style === "atmospheric") return <AtmosphericBackground />;
  return <AuroraBackground />;
}

/** Renders the background chosen in Profile → Preferences → Appearance. */
export function AppBackground() {
  const style = useAppStore((s) => s.preferences.background) ?? "aurora";
  return <BackgroundByStyle style={style} />;
}
