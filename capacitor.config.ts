import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gcognify.tik.die.tok.death.clock",
  appName: "Death Clock",
  webDir: "dist",
  server: {
    androidScheme: "http",
  },
  plugins: {
    Keyboard: {
      resize: "none",
    },
  },
};

export default config;
