import { NOISE, BASE_LAYER_CLASS } from "./shared";

/**
 * Minimal Gradient — fully static, theme-aware.
 * Matte base, soft radial light, edge lighting, grain, vignette.
 */
export function MinimalGradientBackground() {
  return (
    <div
      aria-hidden="true"
      className={BASE_LAYER_CLASS}
      style={{ backgroundColor: "var(--bg-base)", contain: "strict" }}
    >
      {/* soft top light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(95% 58% at 50% -12%, rgba(var(--aurora-1),0.9) 0%, transparent 66%)",
          opacity: "var(--aurora-op-1)",
        }}
      />
      {/* balance from the bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(72% 46% at 50% 108%, rgba(var(--aurora-2),0.9) 0%, transparent 70%)",
          opacity: "var(--aurora-op-2)",
        }}
      />
      {/* edge lighting */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,var(--aurora-sheen)) 0%, transparent 12%, transparent 88%, rgba(255,255,255,var(--aurora-sheen)) 100%)",
        }}
      />
      {/* grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: NOISE,
          backgroundRepeat: "repeat",
          opacity: "var(--aurora-noise)",
          mixBlendMode: "overlay",
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 45%, transparent 38%, var(--aurora-vignette) 84%, var(--aurora-vignette) 100%)",
        }}
      />
    </div>
  );
}
