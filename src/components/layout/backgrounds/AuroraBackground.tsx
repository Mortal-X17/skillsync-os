import { NOISE, BASE_LAYER_CLASS } from "./shared";

/**
 * Option 1 — Premium Animated Aurora.
 * 3 extremely blurred light clouds (purple / indigo / royal blue + cyan hint)
 * at 3–8% opacity, drifting on 60–90s cycles. GPU transforms only.
 */
const CSS = `
@keyframes ss-aurora-a {
  0%,100% { transform: translate3d(-12%, -6%, 0) scale(1); }
  50%     { transform: translate3d(10%, 8%, 0) scale(1.18); }
}
@keyframes ss-aurora-b {
  0%,100% { transform: translate3d(14%, 10%, 0) scale(1.1); }
  50%     { transform: translate3d(-10%, -8%, 0) scale(1); }
}
@keyframes ss-aurora-c {
  0%,100% { transform: translate3d(0%, 14%, 0) scale(1); }
  50%     { transform: translate3d(8%, -12%, 0) scale(1.22); }
}
@media (prefers-reduced-motion: reduce) {
  .ss-aurora-blob { animation: none !important; }
}
`;

export function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className={BASE_LAYER_CLASS}
      style={{ backgroundColor: "var(--background)", contain: "strict" }}
    >
      <style>{CSS}</style>

      <div
        className="ss-aurora-blob absolute left-[-25%] top-[-20%] h-[85vh] w-[85vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.55) 0%, transparent 70%)",
          filter: "blur(120px)",
          opacity: 0.075,
          animation: "ss-aurora-a 72s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        className="ss-aurora-blob absolute right-[-30%] top-[18%] h-[95vh] w-[95vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.55) 0%, transparent 70%)",
          filter: "blur(140px)",
          opacity: 0.065,
          animation: "ss-aurora-b 88s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        className="ss-aurora-blob absolute bottom-[-30%] left-[10%] h-[80vh] w-[80vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(79,70,229,0.5) 0%, rgba(34,211,238,0.25) 55%, transparent 72%)",
          filter: "blur(130px)",
          opacity: 0.05,
          animation: "ss-aurora-c 64s ease-in-out infinite",
          willChange: "transform",
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
            "radial-gradient(120% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 78%, rgba(0,0,0,0.62) 100%)",
        }}
      />
    </div>
  );
}
