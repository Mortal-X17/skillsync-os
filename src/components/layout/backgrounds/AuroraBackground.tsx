import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { NOISE, BASE_LAYER_CLASS } from "./shared";

/**
 * Animated Aurora — a requestAnimationFrame driven, multi-layered light field.
 *
 * Four large blurred light sources drift in different directions at different
 * speeds to create depth. Only transform / opacity are animated, so the
 * compositor does all the work. Speed is user controlled (Theme → Aurora
 * Speed) and applied instantly through a ref, without remounting layers.
 */

export type AuroraLayer = {
  /** Base radians per second (multiplied by the user speed multiplier). */
  speed: number;
  opacity: number;
  blur: number;
  scale: number;
  direction: "left" | "right";
  /** `rgb` triplet token for the layer colour. */
  color: string;
  /** Drift amplitude in % of the viewport. */
  amp: number;
  phase: number;
};

/** purple → blue → teal → green, blended by overlap. */
export const AURORA_LAYERS: AuroraLayer[] = [
  { speed: 0.08, opacity: 0.35, blur: 80, scale: 1.4, direction: "left", color: "var(--aurora-1)", amp: 12, phase: 0 },
  { speed: 0.12, opacity: 0.25, blur: 120, scale: 1.6, direction: "right", color: "var(--aurora-2)", amp: 15, phase: 1.7 },
  { speed: 0.06, opacity: 0.2, blur: 160, scale: 1.8, direction: "left", color: "var(--aurora-3)", amp: 10, phase: 3.1 },
  { speed: 0.15, opacity: 0.18, blur: 200, scale: 2, direction: "right", color: "var(--aurora-4)", amp: 18, phase: 4.6 },
];

function lightGradient(rgb: string) {
  return `radial-gradient(circle at 50% 50%, rgba(${rgb},0.55) 0%, rgba(${rgb},0.78) 42%, rgba(${rgb},0.34) 62%, transparent 78%)`;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The animated light layers. Used full-screen as the app background and, at a
 * smaller size, as the live preview inside the Aurora Speed control.
 */
export function AuroraField({
  speed,
  scale = 1,
  className,
}: {
  /** User speed multiplier, e.g. 0.12 for Normal. */
  speed: number;
  /** Shrinks blur / size for small previews. */
  scale?: number;
  className?: string;
}) {
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let raf = 0;
    let last = performance.now();
    const t = AURORA_LAYERS.map((l) => l.phase);

    const paint = () => {
      for (let i = 0; i < AURORA_LAYERS.length; i++) {
        const l = AURORA_LAYERS[i]!;
        const el = nodes.current[i];
        if (!el) continue;
        const p = t[i]!;
        const dir = l.direction === "left" ? -1 : 1;
        const x = Math.sin(p) * l.amp * dir;
        const y = Math.cos(p * 0.72) * l.amp * 0.55;
        const s = l.scale * (1 + Math.sin(p * 0.5) * 0.06);
        const o = l.opacity * (0.82 + 0.18 * (0.5 + 0.5 * Math.sin(p * 0.83)));
        el.style.transform = `translate3d(${x}%, ${y}%, 0) scale(${s}) rotate(${Math.sin(p * 0.4) * 8 * dir}deg)`;
        el.style.opacity = String(o);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      // Slow to a crawl when the tab is hidden, and honour reduced motion.
      const mult = document.hidden ? 0 : reduced ? 0.15 : 1;
      if (mult > 0) {
        for (let i = 0; i < t.length; i++) {
          t[i] = (t[i]! + dt * AURORA_LAYERS[i]!.speed * speedRef.current * 12) % (Math.PI * 200);
        }
        paint();
      }
      raf = requestAnimationFrame(tick);
    };

    paint();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={"absolute inset-0 overflow-hidden " + (className ?? "")}
      style={{ opacity: "var(--aurora-strength, 1)" }}
    >
      {AURORA_LAYERS.map((l, i) => (
        <div
          key={i}
          ref={(el) => {
            nodes.current[i] = el;
          }}
          className="absolute rounded-full"
          style={{
            left: i % 2 === 0 ? "-24%" : "22%",
            top: i < 2 ? "-26%" : "18%",
            height: `${70 + i * 8}%`,
            width: `${80 + i * 6}%`,
            background: lightGradient(l.color),
            filter: `blur(${Math.max(24, l.blur * scale)}px)`,
            opacity: l.opacity,
            mixBlendMode: "screen",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}

export function AuroraBackground() {
  const speed = useAppStore((s) => s.preferences.auroraSpeed) ?? 0.12;

  return (
    <div
      aria-hidden="true"
      className={BASE_LAYER_CLASS}
      style={{ backgroundColor: "var(--bg-base)", contain: "strict" }}
    >
      <AuroraField speed={speed} />

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
      {/* ambient core for contrast under content */}
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
