# Aurora Background — Dynamic Boreal Curtain

Rebuild the main light source of the Animated Aurora background as a true northern-lights curtain, keeping the existing purple → blue → cyan palette on the deep navy sky. Faster motion, visible curtain striations, light glares, and a livelier star field.

## What changes visually

- **Main light source** becomes a tilted boreal curtain: a bright core band with vertical striations (folds) rising out of it, instead of one soft diagonal blob.
- **Curtain folds** sway side to side with a skew ripple, each fold at a slightly different width, blur and phase.
- **Light glares**: two soft flare orbs (cyan and purple) breathing at different speeds, plus a hotter thin highlight ribbon riding the curtain core.
- **Stars** stay sparse but gain a faint bloom glow and quicker twinkle; drift speeds up.
- **Rays** below the curtain drift faster and at slightly stronger contrast.
- Dark sky base, horizon glow, grain and vignette stay as they are so overlaid white text keeps its contrast.

## Motion

Roughly 2x faster than today: curtain ripple ~8-14s (was 38-74s), drift/flare breathing ~6-12s, star twinkle ~5-7s. All easing stays smooth so it reads as flowing, not jittery.

## Technical notes

- Only `src/components/layout/backgrounds/AuroraBackground.tsx` is rewritten; layer contract (fixed, `pointer-events-none`, `-z-10`, `contain: strict`) is unchanged.
- Add a `Curtain` layer component built from a masked repeating-linear-gradient for the folds plus a blurred core band; keep the existing `Ribbon`/`Rays`/star helpers for secondary layers.
- Animations remain transform/opacity only (no filter or background-position animation) so the compositor handles them; `prefers-reduced-motion` still freezes everything.
- Existing theme tokens (`--aurora-sky`, `--aurora-stars`, `--aurora-haze`, `--aurora-noise`, `--aurora-vignette`) keep driving light-mode dimming — no `styles.css` change needed.
- Update the "Animated Aurora" swatch in `src/components/layout/backgrounds/shared.ts` so the Appearance picker preview matches the new curtain look.
- No changes to app UI, navigation, cards, store, or the other two background variants.
