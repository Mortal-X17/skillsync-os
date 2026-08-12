/** Shared noise texture used by every background variant. */
export const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

export const BASE_LAYER_CLASS =
  "pointer-events-none fixed inset-0 -z-10 overflow-hidden";

export type BackgroundStyle = "aurora" | "gradient" | "atmospheric";

export const BACKGROUND_OPTIONS: {
  id: BackgroundStyle;
  label: string;
  description: string;
  swatch: string;
}[] = [
  {
    id: "aurora",
    label: "Animated Aurora",
    description: "Flowing northern-lights ribbons and rays over a starlit night sky.",
    swatch:
      "linear-gradient(105deg, transparent 12%, rgba(167,110,255,0.55) 30%, rgba(96,165,250,0.5) 50%, transparent 72%), linear-gradient(95deg, transparent 20%, rgba(103,232,249,0.4) 48%, transparent 78%), radial-gradient(90% 100% at 50% 100%, rgba(59,74,180,0.35), transparent 75%), linear-gradient(to bottom, #070c1a, #060a18)",
  },
  {
    id: "gradient",
    label: "Minimal Gradient",
    description: "Static matte black with soft radial light and a fine grain.",
    swatch:
      "radial-gradient(80% 60% at 50% 0%, rgba(99,102,241,0.20), transparent 70%), #09090b",
  },
  {
    id: "atmospheric",
    label: "Atmospheric",
    description: "Corner lighting and ambient shadow depth. No visible shapes.",
    swatch:
      "radial-gradient(50% 50% at 0% 0%, rgba(124,58,237,0.20), transparent 70%), radial-gradient(50% 50% at 100% 100%, rgba(29,78,216,0.18), transparent 70%), #09090b",
  },
];
