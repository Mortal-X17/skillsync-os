// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * MOBILE_BUILD=1 switches on TanStack Start's SPA shell output, which emits a
 * static `dist/client/index.html`. That file is what Capacitor packages into
 * the Android APK, so the app boots completely offline from the WebView.
 * The normal web build is untouched.
 */
const mobileBuild = process.env["MOBILE_BUILD"] === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(mobileBuild
      ? {
          spa: {
            enabled: true,
            prerender: { enabled: true, outputPath: "/index.html", crawlLinks: false },
          },
        }
      : {}),
  },
});
