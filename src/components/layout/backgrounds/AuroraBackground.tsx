import { NOISE, BASE_LAYER_CLASS } from "./shared";

/**
 * Animated Aurora — 5 layers of quiet energy.
 * 1) matte base  2) three drifting light sources  3) noise
 * 4) radial glow 5) vignette
 *
 * Only transform/opacity animate, so the compositor does all the work.
 */
const CSS = `
@keyframes ss-aurora-a {
  0%,100% { transform: translate3d(-8%, -6%, 0) scale(1) rotate(0deg); }
  33%     { transform: translate3d(6%, 4%, 0) scale(1.14) rotate(6deg); }
  66%     { transform: translate3d(-3%, 9%, 0) scale(1.06) rotate(-4deg); }
}
@keyframes ss-aurora-b {
  0%,100% { transform: translate3d(10%, 8%, 0) scale(1.08) rotate(0deg); }
  50%     { transform: translate3d(-8%, -6%, 0) scale(1) rotate(-8deg); }
}
@keyframes ss-aurora-c {
  0%,100% { transform: translate3d(-4%, 4%, 0) scale(0.96) rotate(0deg); }
  40%     { transform: translate3d(8%, -8%, 0) scale(1.2) rotate(10deg); }
  75%     { transform: translate3d(-6%, -2%, 0) scale(1.05) rotate(4deg); }
}
@keyframes ss-aurora-breathe {
  0%,100% { opacity: 0.85; }
  50%     { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .ss-aurora-blob { animation: none !important; }
}
`;

/** Soft centre, slightly brighter mid-edge → readable focal points. */
function lightGradient(rgb: string, mid = 0.55) {
  return `radial-gradient(circle at 50% 50%, rgba(${rgb},0.42) 0%, rgba(${rgb},0.72) ${mid * 100}%, rgba(${rgb},0.28) ${mid * 100 + 18}%, transparent 76%)`;
}

export function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className={BASE_LAYER_CLASS}
      style={{ backgroundColor: "var(--bg-base)", contain: "strict" }}
    >
      <style>{CSS}</style>

      {/* Light source 1 — upper left */}
      <div
        className="ss-aurora-blob absolute left-[-28%] top-[-22%] h-[78vh] w-[78vh] rounded-full"
        style={{
          background: lightGradient("var(--aurora-1)", 0.5),
          filter: "blur(var(--aurora-blur-1, 150px))",
          opacity: "var(--aurora-op-1)",
          animation:
            "ss-aurora-a 58s cubic-bezier(0.45,0,0.55,1) infinite, ss-aurora-breathe 21s ease-in-out infinite",
          willChange: "transform, opacity",
          transform: "translateZ(0)",
        }}
      />
      {/* Light source 2 — lower right */}
      <div
        className="ss-aurora-blob absolute bottom-[-32%] right-[-30%] h-[92vh] w-[92vh] rounded-full"
        style={{
          background: lightGradient("var(--aurora-2)", 0.52),
          filter: "blur(var(--aurora-blur-2, 180px))",
          opacity: "var(--aurora-op-2)",
          animation:
            "ss-aurora-b 82s cubic-bezier(0.45,0,0.55,1) infinite, ss-aurora-breathe 27s ease-in-out infinite",
          willChange: "transform, opacity",
          transform: "translateZ(0)",
        }}
      />
      {/* Light source 3 — centre */}
      <div
        className="ss-aurora-blob absolute left-1/2 top-1/2 h-[62vh] w-[62vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: lightGradient("var(--aurora-3)", 0.46),
          filter: "blur(var(--aurora-blur-3, 130px))",
          opacity: "var(--aurora-op-3)",
          animation:
            "ss-aurora-c 47s cubic-bezier(0.45,0,0.55,1) infinite, ss-aurora-breathe 17s ease-in-out infinite",
          willChange: "transform, opacity",
          transform: "translateZ(0)",
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
      {/* radial glow / ambient core for contrast under content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 50% 42%, var(--aurora-core) 0%, transparent 72%)",
        }}
      />
      {/* top sheen */}
      <div
        className="absolute inset-x-0 top-0 h-[32vh]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,var(--aurora-sheen)), transparent)",
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 50%, transparent 38%, var(--aurora-vignette) 82%, var(--aurora-vignette) 100%)",
        }}
      />
    </div>
  );
}
