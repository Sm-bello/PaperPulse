import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smbello.paperpulse',
  appName: 'PaperPulse',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
