/**
 * Builds the offline bundle that Capacitor packages into the Android app.
 *
 * SkillSync renders entirely on the client (`ssr: false` on the root route),
 * so the only thing a server ever sends is a shell document. Inside the APK
 * there is no server, so this script renders that shell once at build time
 * (through the freshly built server entry) and writes it to
 * `dist/client/index.html`. The WebView then boots the whole app from disk with
 * no network at all.
 *
 * Usage:  bun run build:mobile
 */

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const clientDir = join(root, "dist", "client");
const serverEntry = join(root, "dist", "server", "index.mjs");

/* ------------------------------- 1. build ------------------------------- */

console.log("\n> vite build");
execFileSync("bunx", ["vite", "build"], { cwd: root, stdio: "inherit" });

if (!existsSync(clientDir)) {
  throw new Error("dist/client is missing — the web build did not produce client assets.");
}
if (!existsSync(serverEntry)) {
  throw new Error("dist/server/index.mjs is missing — the web build did not produce a server entry.");
}

/* --------------------- 2. render the shell once, offline ------------------ */

const mod = await import(pathToFileURL(serverEntry).href);
const fetchHandler = mod.default?.fetch ?? mod.fetch;
if (typeof fetchHandler !== "function") {
  throw new Error("The built server entry does not expose a fetch handler.");
}

const response = await fetchHandler(new Request("http://localhost/"), {}, {
  waitUntil() {},
  passThroughOnException() {},
});

if (!response.ok) {
  throw new Error(`Rendering the app shell failed with status ${response.status}.`);
}

let html = await response.text();
if (!html.includes("<html")) {
  throw new Error("The rendered shell does not look like an HTML document.");
}

// The APK has no server: drop the remote font stylesheet so the first paint
// never waits on the network. System fallbacks are already declared in CSS.
html = html.replace(
  /<link[^>]+fonts\.googleapis\.com[^>]*>/g,
  "",
);

writeFileSync(join(clientDir, "index.html"), html, "utf8");
// WebView reload / deep-link fallback: serve the same document so the client
// router resolves the path itself instead of showing a 404 page.
copyFileSync(join(clientDir, "index.html"), join(clientDir, "404.html"));

console.log(`\n✔ Offline shell written to dist/client/index.html (${html.length} bytes)`);
