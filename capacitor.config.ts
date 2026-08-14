import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.skillsync.os",
  appName: "SkillSync",
  webDir: "dist/client",
  server: {
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#09090b",
  },
};

export default config;
