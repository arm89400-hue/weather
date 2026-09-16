import type { CapacitorConfig } from '@capacitor/cli';

// server.url makes the app load the live site directly instead of a bundled snapshot, so both
// frontend and backend changes apply instantly with no APK rebuild/reinstall needed - the
// tradeoff is the app needs network access and breaks if this URL changes (e.g. the tunnel
// restarts), at which point a new APK pointing at the new URL is needed. See PROJECT NOTES.
const config: CapacitorConfig = {
  appId: 'com.weather.app',
  appName: 'Weather Alert',
  webDir: 'dist',
  server: {
    url: 'https://implement-share-tba-modems.trycloudflare.com',
    cleartext: false
  }
};

export default config;
