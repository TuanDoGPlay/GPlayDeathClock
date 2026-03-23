import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gcognify.tik.die.tok.death.clock",
  appName: "Death Clock",
  webDir: "dist",
  server: {
    url: "http://192.168.10.10:5173",
    androidScheme: "https",
    cleartext: true,
  },
  plugins: {
    Keyboard: {
      resize: "none",
    },
    NativeAudio: {
      hls: false, // Disable HLS to reduce APK size by ~4MB
    },
  },
};

export default config;
