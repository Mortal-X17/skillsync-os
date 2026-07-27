Implement a new premium background system for SkillSync OS, replacing the current AuroraBackground component.

### Direction chosen
**Geometric Grid Beam** — dark charcoal base with a subtle geometric grid, a soft top-center beam glow, and a vignette edge. Calm, premium, and OS-like. This is a CSS-only replacement that keeps the app fully functional and dark-themed.

### Plan

1. **Rebuild the background component**
   - Replace `src/components/layout/AuroraBackground.tsx` with a four-layer fixed background:
     - Layer 1: deep matte black base (`#09090B` / `var(--background)`)
     - Layer 2: soft top-center radial beam glow (indigo/purple, very low opacity, large blur)
     - Layer 3: subtle geometric grid (`linear-gradient` lines at 32–40px spacing, low opacity)
     - Layer 4: edge vignette (`radial-gradient` from transparent center to dark edges)
   - Add a configurable intensity/blur prop so the user can tune it later.
   - Respect `prefers-reduced-motion` by keeping the grid static and disabling any animated beam drift.

2. **Apply globally via the root layout**
   - Ensure the background is rendered in `src/routes/__root.tsx` behind `<Outlet />` and `<Splash />` so it persists across all routes.
   - Verify the `body` background remains transparent so the fixed background layer is visible.

3. **Design-token compliance**
   - Use CSS variables and semantic tokens from `src/styles.css` instead of hardcoded hex colors where possible.
   - Keep existing colors (indigo/purple) aligned with the current accent engine.

4. **Visual QA**
   - Verify the grid is visible but does not reduce text contrast.
   - Check that the background stays behind all surfaces and toasts.
   - Test on mobile viewport size.

### Implementation notes
- No new dependencies.
- No redesign of existing UI components; only the background layer changes.
- Implementation will be done in under 5 credits via a focused component replacement.

### After implementation
I will run a build check and a quick browser verification to confirm the background renders across routes without errors.