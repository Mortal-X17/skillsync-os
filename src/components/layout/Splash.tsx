import { useEffect, useState } from "react";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 22) return "Good Evening";
  return "Good Night";
}

const KEY = "skillsync:splash-shown";

/**
 * Premium opening experience — shows once per browser session,
 * fades out into the app after ~850ms.
 */
export function Splash() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let shown = true;
    try {
      shown = sessionStorage.getItem(KEY) === "1";
    } catch {
      shown = true;
    }
    if (shown) return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(true);
    const t1 = window.setTimeout(() => setLeaving(true), 850);
    const t2 = window.setTimeout(() => setVisible(false), 1160);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-xl transition-opacity duration-300"
      style={{ opacity: leaving ? 0 : 1 }}
    >
      <div className="animate-float-in text-center">
        <div className="gradient-text text-[30px] font-semibold tracking-[-0.03em]">
          SkillSync OS
        </div>
        <div className="mt-2 text-[15px] font-medium text-foreground/80">
          {greeting()}
        </div>
        <div className="mt-1 text-[12.5px] text-muted-foreground">
          Synchronizing your day…
        </div>
      </div>
      <div className="mt-4 h-[3px] w-28 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full w-full origin-left gradient-primary"
          style={{
            animation: "splash-bar 900ms var(--ease-out-soft) forwards",
          }}
        />
      </div>
      <style>{`@keyframes splash-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </div>
  );
}

export default Splash;
