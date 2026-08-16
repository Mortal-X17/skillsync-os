import { useEffect, useRef, useState } from "react";
import { SkillSyncLogo } from "@/components/brand/SkillSyncLogo";

/**
 * Module-scope guard. A fresh document load (cold app launch, PWA relaunch
 * after termination, reload) creates a fresh module instance, so the launch
 * animation plays. React re-mounts, route changes, modals, theme switches and
 * foreground returns reuse this module, so they never replay it.
 */
let launchPlayed = false;

/** Phase timings (ms) — total ~1.6s. */
const T = {
  darkness: 180,
  energy: 320,
  reveal: 620,
  hold: 480,
  exit: 340,
};
const TIMELINE = T.darkness + T.energy + T.reveal + T.hold;
/** Hard ceiling so a failed init can never trap the user on the splash. */
const MAX_WAIT = 4000;

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Resolves once the app shell is painted and fonts are settled. */
function appReady(): Promise<void> {
  const frame = new Promise<void>((res) =>
    requestAnimationFrame(() => requestAnimationFrame(() => res())),
  );
  const fonts =
    typeof document !== "undefined" && "fonts" in document
      ? (document as Document & { fonts: FontFaceSet }).fonts.ready.then(() => undefined)
      : Promise.resolve();
  return Promise.all([frame, fonts]).then(() => undefined);
}

/**
 * SkillSync OS launch experience: darkness → energy → logo reveal → hold →
 * transition. Mounted once at the router root; holds the final logo state
 * until the app is ready, then dissolves into the dashboard.
 */
export function AppLaunchScreen() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    if (launchPlayed) return;
    launchPlayed = true;
    reduced.current = prefersReducedMotion();
    setVisible(true);

    const timeline = reduced.current ? 520 : TIMELINE;
    const started = performance.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      setLeaving(true);
      window.setTimeout(() => setVisible(false), reduced.current ? 200 : T.exit);
    };

    const minWait = new Promise<void>((res) =>
      window.setTimeout(res, timeline),
    );
    const cap = window.setTimeout(finish, MAX_WAIT);

    void Promise.all([minWait, appReady()]).then(() => {
      const elapsed = performance.now() - started;
      window.setTimeout(finish, Math.max(0, timeline - elapsed));
    });

    return () => window.clearTimeout(cap);
  }, []);

  if (!visible) return null;
  const r = reduced.current;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[95] flex flex-col items-center justify-center overflow-hidden bg-background"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving && !r ? "scale(1.03)" : "scale(1)",
        transition: `opacity ${r ? 200 : T.exit}ms ease-out, transform ${T.exit}ms ease-out`,
        willChange: "opacity, transform",
      }}
    >
      {/* Phase 2 — energy field gathering at the center */}
      {!r ? (
        <div
          className="absolute inset-0"
          style={{ opacity: "var(--launch-glow, 1)" }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.30) 0%, rgba(34,211,238,0.14) 38%, transparent 70%)",
              filter: "blur(36px)",
              animation: `ss-energy 900ms var(--ease-out-soft, cubic-bezier(.22,1,.36,1)) ${T.darkness}ms both`,
              willChange: "opacity, transform",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[2px] -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 1,
              boxShadow: "0 0 24px 6px rgba(168,85,247,0.55)",
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9), transparent)",
              height: 260,
              animation: `ss-beam 720ms ease-out ${T.darkness}ms both`,
              willChange: "opacity, transform",
            }}
          />
        </div>
      ) : null}


      {/* Phase 3/4 — logo forms, then holds */}
      <div
        className="relative"
        style={{
          animation: r
            ? "ss-logo-simple 320ms ease-out both"
            : `ss-logo 700ms cubic-bezier(.16,1,.3,1) ${T.darkness + T.energy - 120}ms both`,
          willChange: "opacity, transform, filter",
        }}
      >
        <SkillSyncLogo size={132} />
      </div>

      <div
        className="relative mt-6 text-[15px] font-semibold tracking-[-0.01em] text-foreground"
        style={{
          animation: r
            ? "ss-logo-simple 320ms ease-out 80ms both"
            : `ss-word 520ms ease-out ${T.darkness + T.energy + T.reveal - 260}ms both`,
        }}
      >
        SkillSync <span className="gradient-text">OS</span>
      </div>

      <style>{`
        @keyframes ss-energy {
          0% { opacity: 0; transform: translate(-50%,-50%) scale(.55); }
          60% { opacity: 1; }
          100% { opacity: .85; transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes ss-beam {
          0% { opacity: 0; transform: translate(-50%,-50%) scaleY(.1); }
          45% { opacity: 1; transform: translate(-50%,-50%) scaleY(1); }
          100% { opacity: 0; transform: translate(-50%,-50%) scaleY(1.1); }
        }
        @keyframes ss-logo {
          0% { opacity: 0; transform: scale(.85); filter: blur(10px); }
          70% { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes ss-word {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes ss-logo-simple {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default AppLaunchScreen;
