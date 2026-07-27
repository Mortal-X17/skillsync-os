import { useMemo } from "react";

/**
 * GeometricGridBeam — premium architectural background.
 *
 * Layer 1: deep matte black base (--background)
 * Layer 2: soft top-center radial beam glow (primary/indigo family)
 * Layer 3: subtle geometric grid lines
 * Layer 4: fine noise texture for tactile depth
 * Layer 5: soft edge vignette
 *
 * Respects prefers-reduced-motion (static beam and no drift).
 * All tunables are props / the CSS variables below.
 */

type GeometricGridBeamProps = {
  /** Beam blur radius in px — lower = sharper light, higher = softer ambience */
  beamBlur?: number;
  /** Beam opacity multiplier 0..1 */
  beamOpacity?: number;
  /** Grid line spacing in px */
  gridSize?: number;
  /** Grid line opacity 0..1 */
  gridOpacity?: number;
  /** Noise texture opacity 0..1 (keep low, 0.01–0.05) */
  grain?: number;
  /** Vignette strength 0..1 */
  vignette?: number;
  /** Secondary beam color */
  beamColor?: string;
};

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

export function AuroraBackground({
  beamBlur = 140,
  beamOpacity = 0.55,
  gridSize = 44,
  gridOpacity = 0.045,
  grain = 0.025,
  vignette = 0.7,
  beamColor = "var(--primary)",
}: GeometricGridBeamProps) {
  const styleTag = useMemo(
    () => `
      @keyframes beam-breathe {
        0%, 100% {
          opacity: 0.6;
          transform: translate3d(-50%, 0, 0) scale(1);
        }
        50% {
          opacity: 1;
          transform: translate3d(-50%, 0, 0) scale(1.08);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .grid-beam-glow { animation: none !important; }
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

      {/* Layer 2 — top-center radial beam glow */}
      <div
        className="grid-beam-glow absolute left-1/2 top-0"
        style={{
          width: "110vw",
          height: "70vh",
          transform: "translate3d(-50%, 0, 0)",
          background: `radial-gradient(ellipse at 50% 0%, color-mix(in oklab, ${beamColor} ${beamOpacity * 24}%, transparent) 0%, transparent 65%)`,
          filter: `blur(${beamBlur}px)`,
          opacity: 0.8,
          animation: "beam-breathe 14s ease-in-out infinite",
          willChange: "transform, opacity",
        }}
      />

      {/* Layer 3 — geometric grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(1 0 0 / ${gridOpacity}) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(1 0 0 / ${gridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          maskImage: "radial-gradient(120% 100% at 50% 0%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(120% 100% at 50% 0%, black 30%, transparent 80%)",
        }}
      />

      {/* Layer 4 — grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: NOISE,
          backgroundRepeat: "repeat",
          opacity: grain,
          mixBlendMode: "overlay",
        }}
      />

      {/* Layer 5 — vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 100% at 50% 50%, transparent 35%, rgba(0,0,0,${vignette * 0.55}) 75%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
    </div>
  );
}

export default AuroraBackground;
