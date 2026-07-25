import { useMemo } from "react";

/**
 * AuroraBackground
 * A premium, extremely subtle animated aurora that sits behind all app content.
 * - Deep matte black base
 * - 3 huge, heavily-blurred gradient blobs drifting slowly & independently
 * - GPU-friendly transforms only; no blur recalculation per frame
 * - Respects prefers-reduced-motion (static aurora)
 *
 * All tunables live in the `blobs` config below.
 */

type Blob = {
  /** CSS color for the radial gradient center */
  color: string;
  /** Size in viewport units — kept huge so edges never appear */
  size: string;
  /** Initial position (top / left) */
  top: string;
  left: string;
  /** Opacity 0..1 (keep 0.03–0.08) */
  opacity: number;
  /** Animation duration seconds (45–90) */
  duration: number;
  /** Animation delay seconds (desyncs blobs) */
  delay: number;
  /** Which keyframe track to use */
  track: "a" | "b" | "c";
};

const BLOBS: Blob[] = [
  {
    color: "#7c3aed", // purple
    size: "70vmax",
    top: "-25vmax",
    left: "-20vmax",
    opacity: 0.07,
    duration: 72,
    delay: 0,
    track: "a",
  },
  {
    color: "#2563eb", // royal blue / indigo
    size: "65vmax",
    top: "40vh",
    left: "55vw",
    opacity: 0.06,
    duration: 88,
    delay: -18,
    track: "b",
  },
  {
    color: "#22d3ee", // subtle cyan hint
    size: "55vmax",
    top: "70vh",
    left: "-15vmax",
    opacity: 0.035,
    duration: 60,
    delay: -34,
    track: "c",
  },
];

export function AuroraBackground({
  blur = 300,
}: {
  blur?: number;
}) {
  const styleTag = useMemo(
    () => `
      @keyframes aurora-a {
        0%   { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
        50%  { transform: translate3d(6vw, 4vh, 0) scale(1.15) rotate(8deg); }
        100% { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
      }
      @keyframes aurora-b {
        0%   { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
        50%  { transform: translate3d(-7vw, -5vh, 0) scale(1.2) rotate(-10deg); }
        100% { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
      }
      @keyframes aurora-c {
        0%   { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
        50%  { transform: translate3d(5vw, -6vh, 0) scale(1.1) rotate(6deg); }
        100% { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
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
        // Base matte black + very faint global mesh (kept from styles.css body)
        backgroundColor: "#09090b",
        contain: "strict",
      }}
    >
      <style>{styleTag}</style>
      <div
        className="absolute inset-0"
        style={{
          filter: `blur(${blur}px)`,
          // Promote to its own layer so blur is rasterized once
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      >
        {BLOBS.map((b, i) => (
          <div
            key={i}
            className="aurora-blob absolute rounded-full"
            style={{
              width: b.size,
              height: b.size,
              top: b.top,
              left: b.left,
              opacity: b.opacity,
              background: `radial-gradient(circle at center, ${b.color} 0%, ${b.color} 35%, transparent 70%)`,
              animation: `aurora-${b.track} ${b.duration}s ease-in-out ${b.delay}s infinite`,
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default AuroraBackground;
