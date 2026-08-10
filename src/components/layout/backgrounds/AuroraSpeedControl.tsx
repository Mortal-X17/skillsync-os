import { Rabbit, Rocket, Snail, Turtle, Waves } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { haptics } from "@/lib/haptics";
import { AuroraField } from "./AuroraBackground";

export const AURORA_SPEED_PRESETS = [
  { id: "very-slow", label: "Very Slow", value: 0.04, icon: Snail },
  { id: "slow", label: "Slow", value: 0.08, icon: Turtle },
  { id: "normal", label: "Normal", value: 0.12, icon: Waves },
  { id: "fast", label: "Fast", value: 0.18, icon: Rabbit },
  { id: "very-fast", label: "Very Fast", value: 0.25, icon: Rocket },
] as const;

export function auroraSpeedLabel(v: number) {
  const match = AURORA_SPEED_PRESETS.reduce((best, p) =>
    Math.abs(p.value - v) < Math.abs(best.value - v) ? p : best,
  );
  return Math.abs(match.value - v) < 0.005 ? match.label : "Custom";
}

/**
 * Aurora Speed — five descriptive presets, a fine-grained slider and a live
 * animated preview. Changes apply instantly across the whole app.
 */
export function AuroraSpeedControl() {
  const speed = useAppStore((s) => s.preferences.auroraSpeed) ?? 0.12;
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const set = (v: number) =>
    updatePreferences({ auroraSpeed: Math.round(v * 100) / 100 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[14px] font-semibold tracking-tight">
          Aurora Speed
        </div>
        <div className="text-[12px] text-muted-foreground">
          Current:{" "}
          <span className="font-semibold text-foreground">
            {auroraSpeedLabel(speed)} ({speed.toFixed(2)}x)
          </span>
        </div>
      </div>

      {/* Live preview — reflects the selected speed immediately */}
      <div
        className="relative h-24 w-full overflow-hidden rounded-[16px] border border-border"
        style={{ backgroundColor: "var(--bg-base)" }}
        aria-hidden="true"
      >
        <AuroraField speed={speed} scale={0.22} />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {AURORA_SPEED_PRESETS.map((p) => {
          const active = Math.abs(p.value - speed) < 0.005;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                haptics.selection();
                set(p.value);
              }}
              className={
                "flex flex-col items-center gap-1 rounded-[14px] border px-1 py-2.5 transition-all active:scale-[0.97] " +
                (active
                  ? "border-[color-mix(in_oklab,var(--primary)_55%,transparent)] bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] shadow-[var(--shadow-glow)]"
                  : "border-border bg-white/[0.03]")
              }
            >
              <Icon
                className={
                  "h-[18px] w-[18px] " +
                  (active ? "text-[var(--primary-glow)]" : "text-muted-foreground")
                }
                strokeWidth={1.75}
              />
              <span className="text-[10px] font-semibold leading-tight tracking-tight">
                {p.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {p.value.toFixed(2)}x
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={0.02}
          max={0.35}
          step={0.01}
          value={speed}
          onChange={(e) => set(Number(e.target.value))}
          aria-label="Aurora speed multiplier"
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-[var(--primary)]"
          style={{
            background: `linear-gradient(to right, var(--primary) ${((speed - 0.02) / 0.33) * 100}%, color-mix(in oklab, var(--foreground) 10%, transparent) ${((speed - 0.02) / 0.33) * 100}%)`,
          }}
        />
        <div className="text-center text-[12px] font-semibold">
          Custom Speed: {speed.toFixed(2)}x
        </div>
        <div className="text-center text-[11px] text-muted-foreground">
          Lower = slower movement, Higher = faster movement
        </div>
      </div>
    </div>
  );
}
