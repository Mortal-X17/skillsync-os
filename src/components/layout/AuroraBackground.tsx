import { useMemo } from "react";

/**
 * AuroraBackground — layered premium environment.
 *
 * Layer 1: deep matte black base (--background)
 * Layer 2: animated aurora blobs (accent-token driven, GPU transforms only)
 * Layer 3: subtle noise / grain (1–2%)
 * Layer 4: soft edge vignette
 *
 * Respects prefers-reduced-motion (static aurora).
 * All tunables are props / the BLOBS config below.
 */

type Blob = {
  /** CSS color for the radial gradient center */
  color: string;
  /** Size in viewport units — kept huge so edges never appear */
  size: string;
  top: string;
  left: string;
  /** Base opacity 0..1 */
  opacity: number;
  /** Animation duration seconds */
  duration: number;
  /** Animation delay seconds (desyncs blobs) */
  delay: number;
  track: "a" | "b" | "c";
};

const BLOBS: Blob[] = [
  {
    color: "var(--primary)",
    size: "72vmax",
    top: "-26vmax",
    left: "-22vmax",
    opacity: 0.11,
    duration: 62,
    delay: 0,
    track: "a",
  },
  {
    color: "var(--secondary)",
    size: "66vmax",
    top: "38vh",
    left: "52vw",
    opacity: 0.09,
    duration: 78,
    delay: -24,
    track: "b",
  },
  {
    color: "#22d3ee",
    size: "56vmax",
    top: "70vh",
    left: "-16vmax",
    opacity: 0.07,
    duration: 54,
    delay: -40,
    track: "c",
  },
];

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

export function AuroraBackground({
  blur = 280,
  intensity = 1,
  grain = 0.035,
  vignette = 0.7,
}: {
  blur?: number;
  /** Multiplier on all blob opacities */
  intensity?: number;
  /** Noise opacity 0..1 (keep 0.01–0.05) */
  grain?: number;
  /** Vignette strength 0..1 */
  vignette?: number;
}) {
  const styleTag = useMemo(
    () => `
      @keyframes aurora-a {
        0%   { transform: translate3d(0,0,0) scale(1) rotate(0deg); opacity: 0.45; }
        20%  { transform: translate3d(16vw, 10vh, 0) scale(1.35) rotate(18deg); opacity: 0.75; }
        40%  { transform: translate3d(28vw, -4vh, 0) scale(1.55) rotate(32deg); opacity: 0.55; }
        60%  { transform: translate3d(8vw, -16vh, 0) scale(1.25) rotate(12deg); opacity: 0.8; }
        80%  { transform: translate3d(-6vw, 4vh, 0) scale(1.1) rotate(-6deg); opacity: 0.6; }
        100% { transform: translate3d(0,0,0) scale(1) rotate(0deg); opacity: 0.45; }
      }
      @keyframes aurora-b {
        0%   { transform: translate3d(0,0,0) scale(1) rotate(0deg); opacity: 0.35; }
        20%  { transform: translate3d(-18vw, -12vh, 0) scale(1.4) rotate(-22deg); opacity: 0.65; }
        40%  { transform: translate3d(-6vw, 8vh, 0) scale(1.2) rotate(-8deg); opacity: 0.45; }
        60%  { transform: translate3d(-24vw, -4vh, 0) scale(1.45) rotate(-26deg); opacity: 0.55; }
        80%  { transform: translate3d(-10vw, -14vh, 0) scale(1.15) rotate(-12deg); opacity: 0.7; }
        100% { transform: translate3d(0,0,0) scale(1) rotate(0deg); opacity: 0.35; }
      }
      @keyframes aurora-c {
        0%   { transform: translate3d(0,0,0) scale(1) rotate(0deg); opacity: 0.25; }
        20%  { transform: translate3d(12vw, -16vh, 0) scale(1.28) rotate(16deg); opacity: 0.55; }
        40%  { transform: translate3d(22vw, 4vh, 0) scale(1.48) rotate(28deg); opacity: 0.4; }
        60%  { transform: translate3d(4vw, 10vh, 0) scale(1.18) rotate(8deg); opacity: 0.5; }
        80%  { transform: translate3d(18vw, -8vh, 0) scale(1.32) rotate(20deg); opacity: 0.6; }
        100% { transform: translate3d(0,0,0) scale(1) rotate(0deg); opacity: 0.25; }
      }
      @media (prefers-reduced-motion: reduce) {
        .aurora-blob { animation: none !important; }
      }
    `,
    [],
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        backgroundColor: "var(--background)",
        contain: "strict",
      }}
    >
      <style>{styleTag}</style>

      {/* Layer 2 — aurora */}
      <div
        className="absolute inset-0"
        style={{
          filter: `blur(${blur}px)`,
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      >
        {BLOBS.map((b, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: b.size,
              height: b.size,
              top: b.top,
              left: b.left,
              opacity: b.opacity * intensity,
            }}
          >
            <div
              className="aurora-blob h-full w-full rounded-full"
              style={{
                background: `radial-gradient(circle at center, ${b.color} 0%, ${b.color} 35%, transparent 70%)`,
                animation: `aurora-${b.track} ${b.duration}s ease-in-out ${b.delay}s infinite`,
                willChange: "transform",
              }}
            />
          </div>
        ))}

      </div>

      {/* Layer 3 — grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: NOISE,
          backgroundRepeat: "repeat",
          opacity: grain,
          mixBlendMode: "overlay",
        }}
      />

      {/* Layer 4 — vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 50% 40%, transparent 42%, rgba(0,0,0,${vignette * 0.55}) 78%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
    </div>
  );
}

export default AuroraBackground;
