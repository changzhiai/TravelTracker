import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.changzhiai.traveltracker.app',
  appName: 'Travel Tracker',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'light',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
