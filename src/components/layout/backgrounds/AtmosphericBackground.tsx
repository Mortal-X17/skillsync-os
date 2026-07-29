import { NOISE, BASE_LAYER_CLASS } from "./shared";

/**
 * Option 3 — Premium Atmospheric.
 * Layered corner lighting, ambient shadow falloff and a deeper noise
 * texture. No visible shapes or obvious gradient bands.
 */
export function AtmosphericBackground() {
  return (
    <div
      aria-hidden="true"
      className={BASE_LAYER_CLASS}
      style={{ backgroundColor: "var(--background)", contain: "strict" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(55% 40% at 0% 0%, rgba(124,58,237,0.14) 0%, transparent 68%)",
            "radial-gradient(55% 40% at 100% 0%, rgba(56,89,214,0.12) 0%, transparent 68%)",
            "radial-gradient(60% 45% at 100% 100%, rgba(29,78,216,0.12) 0%, transparent 70%)",
            "radial-gradient(60% 45% at 0% 100%, rgba(88,28,135,0.11) 0%, transparent 70%)",
          ].join(","),
          filter: "blur(24px)",
        }}
      />
      {/* ambient shadow core — keeps the centre deep and readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 55% at 50% 50%, rgba(0,0,0,0.55) 0%, transparent 75%)",
        }}
      />
      {/* soft top sheen */}
      <div
        className="absolute inset-x-0 top-0 h-[38vh]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.035), transparent)",
        }}
      />
      {/* grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: NOISE,
          backgroundRepeat: "repeat",
          opacity: 0.032,
          mixBlendMode: "overlay",
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 50%, transparent 32%, rgba(0,0,0,0.5) 76%, rgba(0,0,0,0.72) 100%)",
        }}
      />
    </div>
  );
}
