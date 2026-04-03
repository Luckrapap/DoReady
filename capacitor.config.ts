import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.doready.app',
  appName: 'DoReady',
  webDir: 'out',
  /*
  server: {
    url: 'https://do-ready.vercel.app/',
    allowNavigation: ['do-ready.vercel.app'],
    cleartext: true
  },
  */
  android: {
    backgroundColor: "#000000"
  }
};

export default config;
