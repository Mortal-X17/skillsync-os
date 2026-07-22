# SkillSync — Build the Android APK

This project is packaged with **Capacitor**. You build the web app once, then
wrap it in a native Android shell to get an installable `.apk`.

## One-time setup on your machine

You need:

1. **Node.js 20+** and **bun** (or npm).
2. **Android Studio** (bundles the Android SDK + Java + Gradle).
   Download → <https://developer.android.com/studio>
3. During Android Studio setup, accept the SDK licenses when prompted.

## Build steps

From the project root:

```bash
# 1) Install deps (already done in Lovable)
bun install

# 2) Build the web app (outputs static files to .output/public)
bun run build

# 3) Add the Android platform (first time only)
bunx cap add android

# 4) Copy the built web app into the Android project
bunx cap sync android

# 5) Build a debug APK
cd android
./gradlew assembleDebug
```

Your APK is here:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Copy it to your phone and install it (enable "Install unknown apps" for your
file manager first).

## Updating the app later

Every time you change the code:

```bash
bun run build
bunx cap sync android
cd android && ./gradlew assembleDebug
```

Your data is stored in the app's local storage and **survives updates** as
long as you keep the same `appId` (`com.skillsync.os`) and don't uninstall.

## Release APK (signed)

For a signed release build later:

1. In Android Studio: `Build → Generate Signed Bundle / APK`
2. Create a keystore (save it — you need it for every future update).
3. Choose APK, release variant, sign, and build.

## Notes

- SkillSync is 100% offline. No cloud dependencies, no network required.
- All data lives in the WebView's `localStorage`, backed up via the
  Profile → Backup → **Export** button (produces a `.json` file).
- To restore on a new device: install the APK, open Profile → Backup →
  **Import**, and pick the file.
