import { NOISE, BASE_LAYER_CLASS } from "./shared";

/**
 * Northern-lights Aurora — a layered, GPU-friendly light system.
 *
 * Layer order (back → front)
 *  1. deep night sky base
 *  2. sparse twinkling stars
 *  3. wide atmospheric aurora haze (very subtle)
 *  4. flowing luminous ribbons with defined cores (A–D)
 *  5. downward moving rays
 *  6. grain + vignette
 *
 * Only transform / opacity animate, so the compositor does the work.
 * Dark sky stays dominant: ribbons are narrow, masked and independent.
 */
const CSS = `
@keyframes ss-rib-a {
  0%,100% { transform: rotate(-18deg) translate3d(-6%, 0, 0) scaleY(1); }
  50%     { transform: rotate(-13deg) translate3d(7%, 2%, 0) scaleY(1.12); }
}
@keyframes ss-rib-b {
  0%,100% { transform: rotate(-8deg) translate3d(5%, 1%, 0) scaleY(1.06); }
  50%     { transform: rotate(-15deg) translate3d(-6%, -2%, 0) scaleY(0.94); }
}
@keyframes ss-rib-c {
  0%,100% { transform: rotate(-24deg) translate3d(3%, -1%, 0) scaleY(0.96); }
  45%     { transform: rotate(-17deg) translate3d(-8%, 3%, 0) scaleY(1.14); }
}
@keyframes ss-rib-d {
  0%,100% { transform: rotate(-30deg) translate3d(-10%, 2%, 0) scaleY(1); }
  50%     { transform: rotate(-22deg) translate3d(9%, -3%, 0) scaleY(1.2); }
}
@keyframes ss-rib-e {
  0%,100% { transform: rotate(6deg) translate3d(4%, 0, 0) scaleY(1.05); }
  50%     { transform: rotate(-4deg) translate3d(-5%, 2%, 0) scaleY(0.95); }
}
@keyframes ss-glow-breathe {
  0%,100% { opacity: 0.72; }
  50%     { opacity: 1; }
}
@keyframes ss-rays-drift {
  0%,100% { transform: translate3d(-4%, 0, 0) skewX(-6deg) scaleY(1); }
  50%     { transform: translate3d(4%, 0, 0) skewX(2deg) scaleY(1.1); }
}
@keyframes ss-rays-drift-2 {
  0%,100% { transform: translate3d(5%, 0, 0) skewX(7deg) scaleY(1.08); }
  50%     { transform: translate3d(-5%, 0, 0) skewX(-3deg) scaleY(0.96); }
}
@keyframes ss-twinkle {
  0%,100% { opacity: 0.5; }
  50%     { opacity: 1; }
}
@keyframes ss-stars-drift {
  0%   { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-2%, 1.5%, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .ss-aur * { animation: none !important; }
}
`;

/** A single aurora ribbon: bright core, inner glow, soft outer halo. */
function Ribbon({
  core,
  glow,
  className,
  style,
  blur,
  opacity,
  animation,
}: {
  core: string;
  glow: string;
  className?: string;
  style?: React.CSSProperties;
  blur: number;
  opacity: number;
  animation: string;
}) {
  return (
    <div
      className={"absolute " + (className ?? "")}
      style={{
        opacity,
        filter: `blur(${blur}px)`,
        animation,
        willChange: "transform, opacity",
        transform: "translateZ(0)",
        // core stripe + halo, faded at both ends so it reads as a ribbon
        background: `linear-gradient(to right, transparent 0%, ${glow} 18%, ${core} 47%, ${core} 53%, ${glow} 82%, transparent 100%)`,
        maskImage:
          "radial-gradient(60% 100% at 50% 45%, #000 0%, rgba(0,0,0,0.75) 55%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(60% 100% at 50% 45%, #000 0%, rgba(0,0,0,0.75) 55%, transparent 100%)",
        borderRadius: "50%",
        ...style,
      }}
    />
  );
}

/** Vertical ray curtain built from one repeating gradient (cheap). */
function Rays({
  className,
  hue,
  opacity,
  animation,
  blur,
  size,
}: {
  className?: string;
  hue: string;
  opacity: number;
  animation: string;
  blur: number;
  size: number;
}) {
  return (
    <div
      className={"absolute " + (className ?? "")}
      style={{
        opacity,
        filter: `blur(${blur}px)`,
        animation,
        willChange: "transform, opacity",
        transformOrigin: "50% 0%",
        backgroundImage: `repeating-linear-gradient(90deg,
          transparent 0px,
          transparent ${size * 0.42}px,
          rgba(${hue},0.5) ${size * 0.47}px,
          rgba(${hue},0.85) ${size * 0.5}px,
          rgba(${hue},0.5) ${size * 0.53}px,
          transparent ${size * 0.58}px,
          transparent ${size}px)`,
        maskImage:
          "linear-gradient(to bottom, transparent 0%, #000 14%, rgba(0,0,0,0.5) 55%, transparent 92%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, #000 14%, rgba(0,0,0,0.5) 55%, transparent 92%)",
      }}
    />
  );
}

const STAR_FIELD = [
  "8% 12%",
  "17% 34%",
  "24% 7%",
  "31% 52%",
  "38% 21%",
  "44% 68%",
  "52% 9%",
  "58% 41%",
  "63% 76%",
  "69% 17%",
  "74% 57%",
  "81% 29%",
  "87% 63%",
  "92% 14%",
  "96% 44%",
  "12% 71%",
  "27% 88%",
  "48% 84%",
  "66% 92%",
  "84% 81%",
]
  .map(
    (p) =>
      `radial-gradient(1.1px 1.1px at ${p}, rgba(226,240,255,0.9) 0%, transparent 100%)`,
  )
  .join(",");

export function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className={BASE_LAYER_CLASS + " ss-aur"}
      style={{ backgroundColor: "var(--bg-base)", contain: "strict" }}
    >
      <style>{CSS}</style>

      {/* deep sky gradient — dark but never flat black at the bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #070c1a 0%, #050813 42%, #060a18 78%, #070b19 100%)",
          opacity: "var(--aurora-sky, 1)",
        }}
      />
      {/* horizon glow — removes the dead black patch near the bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46vh]"
        style={{
          background:
            "radial-gradient(90% 100% at 50% 100%, rgba(59,74,180,0.22) 0%, rgba(30,41,120,0.12) 45%, transparent 80%)",
          filter: "blur(40px)",
          opacity: "var(--aurora-haze, 0.85)",
          animation: "ss-glow-breathe 28s ease-in-out infinite",
          willChange: "opacity",
        }}
      />


      {/* stars */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: STAR_FIELD,
          backgroundSize: "100% 100%",
          opacity: "var(--aurora-stars, 0.55)",
          animation:
            "ss-twinkle 9s ease-in-out infinite, ss-stars-drift 180s linear infinite alternate",
          willChange: "opacity, transform",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: STAR_FIELD,
          backgroundSize: "62% 58%",
          opacity: "var(--aurora-stars-2, 0.3)",
          animation: "ss-twinkle 13s ease-in-out 2s infinite",
          willChange: "opacity",
        }}
      />

      {/* wide atmospheric haze around the upper aurora (subtle) */}
      <div
        className="absolute -top-[18%] left-1/2 h-[70vh] w-[150vw] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(76,29,149,0.30) 0%, rgba(29,78,216,0.18) 45%, transparent 78%)",
          filter: "blur(70px)",
          opacity: "var(--aurora-haze, 0.85)",
          animation: "ss-glow-breathe 24s ease-in-out infinite",
          willChange: "opacity",
        }}
      />

      {/* ---- Ribbons (upper sky) ---- */}
      {/* A — deep violet */}
      <Ribbon
        className="left-[-25%] top-[4%] h-[26vh] w-[110%]"
        core="rgba(167,110,255,0.85)"
        glow="rgba(107,44,192,0.28)"
        blur={16}
        opacity={0.75}
        animation="ss-rib-a 46s ease-in-out infinite, ss-glow-breathe 19s ease-in-out infinite"
      />
      {/* B — electric blue */}
      <Ribbon
        className="left-[-20%] top-[14%] h-[22vh] w-[115%]"
        core="rgba(96,165,250,0.9)"
        glow="rgba(29,78,216,0.26)"
        blur={14}
        opacity={0.7}
        animation="ss-rib-b 61s ease-in-out infinite, ss-glow-breathe 23s ease-in-out infinite"
      />
      {/* C — cyan / turquoise */}
      <Ribbon
        className="left-[-15%] top-[24%] h-[18vh] w-[105%]"
        core="rgba(103,232,249,0.85)"
        glow="rgba(6,182,212,0.22)"
        blur={12}
        opacity={0.6}
        animation="ss-rib-c 53s ease-in-out infinite, ss-glow-breathe 17s ease-in-out infinite"
      />
      {/* D — thin high-energy crossing ribbon */}
      <Ribbon
        className="left-[-10%] top-[10%] h-[9vh] w-[95%]"
        core="rgba(216,180,254,0.95)"
        glow="rgba(124,58,237,0.24)"
        blur={7}
        opacity={0.55}
        animation="ss-rib-d 38s ease-in-out infinite, ss-glow-breathe 13s ease-in-out infinite"
      />
      {/* E — secondary emerald whisper */}
      <Ribbon
        className="left-[-12%] top-[32%] h-[14vh] w-[100%]"
        core="rgba(52,211,153,0.55)"
        glow="rgba(16,185,129,0.14)"
        blur={22}
        opacity={0.32}
        animation="ss-rib-e 74s ease-in-out infinite"
      />

      {/* ---- Downward moving rays ---- */}
      <Rays
        className="left-[-10%] top-[16%] h-[74vh] w-[120%]"
        hue="130,180,255"
        opacity={0.2}
        blur={5}
        size={150}
        animation="ss-rays-drift 44s ease-in-out infinite"
      />
      <Rays
        className="left-[-15%] top-[22%] h-[64vh] w-[130%]"
        hue="120,235,255"
        opacity={0.16}
        blur={9}
        size={230}
        animation="ss-rays-drift-2 67s ease-in-out infinite"
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

      {/* keep the dark sky dominant behind content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 100% at 50% 45%, transparent 42%, var(--aurora-vignette) 95%, var(--aurora-vignette) 100%)",
        }}
      />
    </div>
  );
}
