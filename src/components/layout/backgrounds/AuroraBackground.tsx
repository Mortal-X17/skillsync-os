import { NOISE, BASE_LAYER_CLASS } from "./shared";

/**
 * Northern-lights Aurora — "Dynamic Boreal Curtain".
 *
 * Layer order (back → front)
 *  1. deep night sky base + horizon glow
 *  2. sparse blooming stars (two fields, twinkle + drift)
 *  3. wide atmospheric haze
 *  4. MAIN LIGHT SOURCE: tilted boreal curtain — striated folds rising from a
 *     bright core band, with a hotter highlight ribbon riding the core
 *  5. secondary ribbons + drifting ray curtains
 *  6. light glares (flare orbs)
 *  7. grain + vignette
 *
 * Only transform / opacity animate, so the compositor does the work.
 * Motion is ~2x faster than the previous revision.
 */
const CSS = `
@keyframes ss-curtain-sway {
  0%,100% { transform: rotate(-14deg) skewX(-7deg) translate3d(-4%, 0, 0) scaleY(1); }
  50%     { transform: rotate(-9deg)  skewX(6deg)  translate3d(5%, 1.5%, 0) scaleY(1.12); }
}
@keyframes ss-curtain-sway-2 {
  0%,100% { transform: rotate(-20deg) skewX(8deg) translate3d(4%, 1%, 0) scaleY(1.08); }
  50%     { transform: rotate(-12deg) skewX(-5deg) translate3d(-5%, -1%, 0) scaleY(0.94); }
}
@keyframes ss-core-drift {
  0%,100% { transform: rotate(-11deg) translate3d(-5%, 0, 0) scaleY(1); }
  50%     { transform: rotate(-7deg)  translate3d(5%, 1%, 0) scaleY(1.18); }
}
@keyframes ss-rib-a {
  0%,100% { transform: rotate(-18deg) translate3d(-6%, 0, 0) scaleY(1); }
  50%     { transform: rotate(-13deg) translate3d(7%, 2%, 0) scaleY(1.12); }
}
@keyframes ss-rib-c {
  0%,100% { transform: rotate(-24deg) translate3d(3%, -1%, 0) scaleY(0.96); }
  45%     { transform: rotate(-17deg) translate3d(-8%, 3%, 0) scaleY(1.14); }
}
@keyframes ss-rib-e {
  0%,100% { transform: rotate(6deg) translate3d(4%, 0, 0) scaleY(1.05); }
  50%     { transform: rotate(-4deg) translate3d(-5%, 2%, 0) scaleY(0.95); }
}
@keyframes ss-glow-breathe {
  0%,100% { opacity: 0.7; }
  50%     { opacity: 1; }
}
@keyframes ss-flare {
  0%,100% { opacity: 0.45; transform: scale(0.94); }
  50%     { opacity: 1;    transform: scale(1.1); }
}
@keyframes ss-rays-drift {
  0%,100% { transform: translate3d(-5%, 0, 0) skewX(-7deg) scaleY(1); }
  50%     { transform: translate3d(5%, 0, 0) skewX(3deg) scaleY(1.12); }
}
@keyframes ss-rays-drift-2 {
  0%,100% { transform: translate3d(6%, 0, 0) skewX(8deg) scaleY(1.1); }
  50%     { transform: translate3d(-6%, 0, 0) skewX(-4deg) scaleY(0.95); }
}
@keyframes ss-twinkle {
  0%,100% { opacity: 0.42; }
  50%     { opacity: 1; }
}
@keyframes ss-stars-drift {
  0%   { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-3%, 2%, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .ss-aur * { animation: none !important; }
}
`;

/** Striated curtain folds: vertical bands rising out of the aurora core. */
function CurtainFolds({
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
        transformOrigin: "50% 100%",
        backgroundImage: `repeating-linear-gradient(90deg,
          transparent 0px,
          transparent ${size * 0.3}px,
          rgba(${hue},0.35) ${size * 0.4}px,
          rgba(${hue},0.9) ${size * 0.5}px,
          rgba(${hue},0.35) ${size * 0.6}px,
          transparent ${size * 0.72}px,
          transparent ${size}px)`,
        maskImage:
          "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.85) 18%, #000 42%, rgba(0,0,0,0.4) 78%, transparent 100%), radial-gradient(70% 100% at 50% 60%, #000 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.85) 18%, #000 42%, rgba(0,0,0,0.4) 78%, transparent 100%), radial-gradient(70% 100% at 50% 60%, #000 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    />
  );
}

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

/** Soft breathing flare orb — the "light glare". */
function Flare({
  className,
  color,
  blur,
  animation,
}: {
  className?: string;
  color: string;
  blur: number;
  animation: string;
}) {
  return (
    <div
      className={"absolute rounded-full " + (className ?? "")}
      style={{
        background: `radial-gradient(50% 50% at 50% 50%, ${color} 0%, transparent 72%)`,
        filter: `blur(${blur}px)`,
        animation,
        willChange: "transform, opacity",
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
      `radial-gradient(1.6px 1.6px at ${p}, rgba(226,240,255,0.95) 0%, rgba(180,210,255,0.35) 38%, transparent 100%)`,
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
      {/* horizon glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46vh]"
        style={{
          background:
            "radial-gradient(90% 100% at 50% 100%, rgba(59,74,180,0.22) 0%, rgba(30,41,120,0.12) 45%, transparent 80%)",
          filter: "blur(40px)",
          opacity: "var(--aurora-haze, 0.85)",
          animation: "ss-glow-breathe 14s ease-in-out infinite",
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
            "ss-twinkle 5s ease-in-out infinite, ss-stars-drift 80s linear infinite alternate",
          willChange: "opacity, transform",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: STAR_FIELD,
          backgroundSize: "62% 58%",
          opacity: "var(--aurora-stars-2, 0.3)",
          animation: "ss-twinkle 7s ease-in-out 1.2s infinite",
          willChange: "opacity",
        }}
      />

      {/* wide atmospheric haze around the upper aurora */}
      <div
        className="absolute -top-[18%] left-1/2 h-[70vh] w-[150vw] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(76,29,149,0.30) 0%, rgba(29,78,216,0.18) 45%, transparent 78%)",
          filter: "blur(70px)",
          opacity: "var(--aurora-haze, 0.85)",
          animation: "ss-glow-breathe 12s ease-in-out infinite",
          willChange: "opacity",
        }}
      />

      {/* ================= MAIN LIGHT SOURCE — boreal curtain ================= */}
      {/* soft body glow behind the folds */}
      <div
        className="absolute left-[-25%] top-[-6%] h-[54vh] w-[150%]"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(147,89,255,0.26) 20%, rgba(96,165,250,0.30) 48%, rgba(103,232,249,0.24) 74%, transparent 100%)",
          filter: "blur(70px)",
          opacity: 0.85,
          animation:
            "ss-core-drift 14s ease-in-out infinite, ss-glow-breathe 9s ease-in-out infinite",
          willChange: "transform, opacity",
          maskImage:
            "radial-gradient(70% 100% at 50% 55%, #000 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(70% 100% at 50% 55%, #000 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
        }}
      />
      {/* violet folds */}
      <CurtainFolds
        className="left-[-22%] top-[-4%] h-[48vh] w-[145%]"
        hue="167,110,255"
        opacity={0.42}
        blur={13}
        size={116}
        animation="ss-curtain-sway 11s ease-in-out infinite, ss-glow-breathe 8s ease-in-out infinite"
      />
      {/* blue folds */}
      <CurtainFolds
        className="left-[-18%] top-[0%] h-[44vh] w-[140%]"
        hue="96,165,250"
        opacity={0.4}
        blur={10}
        size={74}
        animation="ss-curtain-sway-2 9s ease-in-out infinite, ss-glow-breathe 6.5s ease-in-out infinite"
      />
      {/* cyan folds — finest, brightest tips */}
      <CurtainFolds
        className="left-[-14%] top-[4%] h-[38vh] w-[130%]"
        hue="130,240,255"
        opacity={0.3}
        blur={7}
        size={48}
        animation="ss-curtain-sway 8s ease-in-out 1s infinite"
      />
      {/* hot core band riding the curtain base */}
      <Ribbon
        className="left-[-16%] top-[26%] h-[12vh] w-[132%]"
        core="rgba(214,238,255,0.9)"
        glow="rgba(96,165,250,0.3)"
        blur={9}
        opacity={0.62}
        animation="ss-core-drift 10s ease-in-out infinite, ss-glow-breathe 7s ease-in-out infinite"
      />
      {/* thin high-energy highlight */}
      <Ribbon
        className="left-[-10%] top-[22%] h-[5vh] w-[112%]"
        core="rgba(216,180,254,0.95)"
        glow="rgba(124,58,237,0.24)"
        blur={5}
        opacity={0.5}
        animation="ss-core-drift 8s ease-in-out 0.6s infinite, ss-glow-breathe 5.5s ease-in-out infinite"
      />

      {/* ---- Secondary ribbons ---- */}
      <Ribbon
        className="left-[-25%] top-[8%] h-[24vh] w-[110%]"
        core="rgba(167,110,255,0.8)"
        glow="rgba(107,44,192,0.26)"
        blur={16}
        opacity={0.55}
        animation="ss-rib-a 21s ease-in-out infinite, ss-glow-breathe 10s ease-in-out infinite"
      />
      <Ribbon
        className="left-[-15%] top-[34%] h-[18vh] w-[105%]"
        core="rgba(103,232,249,0.8)"
        glow="rgba(6,182,212,0.2)"
        blur={13}
        opacity={0.45}
        animation="ss-rib-c 24s ease-in-out infinite, ss-glow-breathe 9s ease-in-out infinite"
      />
      <Ribbon
        className="left-[-12%] top-[44%] h-[14vh] w-[100%]"
        core="rgba(52,211,153,0.5)"
        glow="rgba(16,185,129,0.13)"
        blur={22}
        opacity={0.3}
        animation="ss-rib-e 32s ease-in-out infinite"
      />

      {/* ---- Downward moving rays ---- */}
      <Rays
        className="left-[-10%] top-[24%] h-[74vh] w-[120%]"
        hue="130,180,255"
        opacity={0.22}
        blur={5}
        size={150}
        animation="ss-rays-drift 20s ease-in-out infinite"
      />
      <Rays
        className="left-[-15%] top-[30%] h-[64vh] w-[130%]"
        hue="120,235,255"
        opacity={0.17}
        blur={9}
        size={230}
        animation="ss-rays-drift-2 28s ease-in-out infinite"
      />

      {/* ---- Light glares ---- */}
      <Flare
        className="left-[8%] top-[16%] h-[34vh] w-[34vh]"
        color="rgba(103,232,249,0.16)"
        blur={55}
        animation="ss-flare 9s ease-in-out infinite"
      />
      <Flare
        className="right-[6%] top-[30%] h-[42vh] w-[42vh]"
        color="rgba(167,110,255,0.15)"
        blur={70}
        animation="ss-flare 12s ease-in-out 1.5s infinite"
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
