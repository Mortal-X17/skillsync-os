# SkillSync OS → Signed Android APK

Goal: turn the existing web app into a fully offline, properly signed Android app, built automatically in the cloud (GitHub Actions), with the same signing identity reusable for all future updates.

The app is already well positioned for this: Capacitor 8 (core, cli, android, haptics) is installed, `capacitor.config.ts` targets `com.skillsync.os` with `webDir: .output/public`, rendering is already client-side only (`ssr: false`), and all data lives locally. What is missing: a native Android project, a signing setup, and a CI workflow.

## Step 1 — Confirm the offline web bundle

Run a production build and verify the static output really is a self-contained app:

- `index.html` exists at the root of `.output/public`
- assets, `manifest.webmanifest`, icons and `notifications-sw.js` are copied
- no request to a server function is needed for the first paint

If deep-link reloads inside the WebView 404, add an SPA fallback (`404.html` / `index.html` copy) as part of the build step. No redesign, no feature changes.

## Step 2 — Generate the native Android project

Add the `android/` folder to the repository (`cap add android`, then `cap sync android`) so CI can build it without regenerating native code each run. Adjust the native shell to match the app:

- app name "SkillSync", package `com.skillsync.os`
- launcher + adaptive icons and splash background from the existing brand assets (`#09090b` / deep aurora)
- portrait orientation, dark status/navigation bar, edge-to-edge safe-area handling
- vibration permission so the haptics system works natively
- no internet permission required for app function (kept only if needed by the WebView)

## Step 3 — Signing setup (secure, repeatable)

- Generate one release keystore (`skillsync-release.jks`) with a long validity — this becomes the permanent SkillSync OS signing identity.
- The keystore file and its passwords are **never** committed. `.gitignore` covers `*.jks`, `*.keystore`, `keystore.properties`.
- `android/app/build.gradle` gains a `release` signing config that reads values from environment variables (or a local, ignored `keystore.properties` for local builds), falling back cleanly to unsigned when absent.
- Debug builds stay untouched, so `assembleDebug` keeps working for day-to-day testing.
- You store the keystore in GitHub as secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. I'll give you the exact commands to create the keystore and produce the base64 value on your machine — the private key never leaves it, and never enters this repository or chat.

## Step 4 — GitHub Actions release pipeline

Add `.github/workflows/android.yml`:

- triggers: manual (`workflow_dispatch`) and on version tags `v*`
- steps: checkout → Bun + Node → JDK 21 → Android SDK → `bun install` → `bun run build` → `bunx cap sync android` → decode keystore from secrets → `./gradlew assembleDebug assembleRelease`
- uploads both APKs as downloadable build artifacts; a tag push also attaches the signed release APK to a GitHub Release
- the keystore is decoded to a temp path and removed after the build; no secret is ever echoed to logs

## Step 5 — Versioning for future updates

Introduce a single source of truth for `versionName` / `versionCode` (derived from the tag or a small config), so every future update installs cleanly over the previous one. Because the signing identity never changes, updates upgrade in place and keep all local SkillSync data.

## Step 6 — Documentation

Rewrite `scripts/android-setup.md` into a short guide covering: creating the keystore, adding the four GitHub secrets, running the workflow, downloading the APK, installing it on your phone, and shipping an update. Includes a note that a Play Store submission would need an `.aab` (one extra gradle task, easy to add later).

## Technical notes

- Nothing about the UI, aurora background, haptics, notifications or data model changes.
- Native notification scheduling (`@capacitor/local-notifications`) is deliberately out of scope here; the existing adapter seam already accepts it as a follow-up.
- Local builds remain possible with Android Studio using the same gradle config, reading `keystore.properties` instead of env vars.
