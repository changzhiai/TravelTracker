import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.traveltracker.app',
  appName: 'Travel Tracker',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'light',
      backgroundColor: '#ffffff',
    },
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSplashResourceName: "splash",
      androidOnNonCentredIcon: "true",
    },
  },
};

export default config;
