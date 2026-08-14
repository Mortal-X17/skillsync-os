/**
 * Builds the offline bundle that Capacitor packages into the Android app.
 *
 * The web build renders SkillSync entirely on the client (`ssr: false` on the
 * root route), so the only thing the server ever sends is a shell document.
 * Inside the APK there is no server, so this script emits that same shell as a
 * static `dist/client/index.html`, wired to the real hashed client entry taken
 * from the build manifest.
 *
 * Usage:  bun run build:mobile
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const clientDir = join(root, "dist", "client");
const serverDir = join(root, "dist", "server");

function run(cmd, args) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { cwd: root, stdio: "inherit" });
}

/* ------------------------------- 1. build ------------------------------- */

run("bunx", ["vite", "build"]);

if (!existsSync(clientDir)) {
  throw new Error("dist/client is missing — the web build did not produce client assets.");
}

/* --------------------- 2. read the entry from manifest -------------------- */

const manifestFile = readdirSync(serverDir).find((f) =>
  f.startsWith("_tanstack-start-manifest_v"),
);
if (!manifestFile) {
  throw new Error("Could not find the TanStack Start manifest in dist/server.");
}
const manifestSource = readFileSync(join(serverDir, manifestFile), "utf8");

// The root route's script tag is the client bootstrap (hydrates the whole app).
const rootBlock = manifestSource.slice(manifestSource.indexOf("__root__"));
const scriptMatch = rootBlock.match(/src:\s*"(\/assets\/[^"]+\.js)"/);
if (!scriptMatch) {
  throw new Error("Could not determine the client entry script from the manifest.");
}
const entryScript = scriptMatch[1];

// Root-level preloads keep the first paint fast; harmless if a name changes.
const preloadBlock = rootBlock.slice(0, rootBlock.indexOf("scripts:"));
const preloads = [...preloadBlock.matchAll(/"(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);

const cssFile = readdirSync(join(clientDir, "assets")).find((f) => f.endsWith(".css"));
if (!cssFile) {
  throw new Error("Could not find the compiled stylesheet in dist/client/assets.");
}
const cssHref = `/assets/${cssFile}`;

/* ------------------------- 3. emit the static shell ---------------------- */

const html = `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charSet="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, interactive-widget=resizes-content"
    />
    <meta name="theme-color" content="#09090b" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="SkillSync" />
    <title>SkillSync</title>
    <meta
      name="description"
      content="Your personal growth dashboard: streaks, XP, focus and progress."
    />
    <link rel="stylesheet" href="${cssHref}" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
    <link rel="apple-touch-icon" href="/icon-512.png" sizes="512x512" />
${preloads.map((p) => `    <link rel="modulepreload" href="${p}" />`).join("\n")}
  </head>
  <body class="min-h-[100dvh] bg-background text-foreground antialiased">
    <script type="module" src="${entryScript}"></script>
  </body>
</html>
`;

writeFileSync(join(clientDir, "index.html"), html, "utf8");
// WebView deep-link / reload fallback: same document, so the client router
// resolves the path itself instead of showing a 404 page.
copyFileSync(join(clientDir, "index.html"), join(clientDir, "404.html"));

console.log(`\n✔ Offline shell written to dist/client/index.html`);
console.log(`  entry:      ${entryScript}`);
console.log(`  stylesheet: ${cssHref}`);
console.log(`  preloads:   ${preloads.length}`);
