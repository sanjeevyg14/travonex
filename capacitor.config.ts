
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.travonex.app',
  appName: 'Travonex',
  webDir: 'out',
  server: {
    // This is required for Next.js static exports
    hostname: 'travonex.app',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
