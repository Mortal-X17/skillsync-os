import { NOISE, BASE_LAYER_CLASS } from "./shared";

/**
 * Option 2 — Premium Minimal Gradient.
 * Fully static: matte black, soft radial gradients, edge lighting,
 * vignette and a tiny amount of grain. Zero animation.
 */
export function MinimalGradientBackground() {
  return (
    <div
      aria-hidden="true"
      className={BASE_LAYER_CLASS}
      style={{ backgroundColor: "var(--background)", contain: "strict" }}
    >
      {/* soft top light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 55% at 50% -10%, rgba(99,102,241,0.16) 0%, transparent 65%)",
        }}
      />
      {/* low warm-cool balance from the bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 45% at 50% 108%, rgba(37,99,235,0.12) 0%, transparent 70%)",
        }}
      />
      {/* edge lighting */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.035) 0%, transparent 12%, transparent 88%, rgba(255,255,255,0.035) 100%)",
        }}
      />
      {/* grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: NOISE,
          backgroundRepeat: "repeat",
          opacity: 0.022,
          mixBlendMode: "overlay",
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 45%, transparent 38%, rgba(0,0,0,0.45) 80%, rgba(0,0,0,0.68) 100%)",
        }}
      />
    </div>
  );
}
