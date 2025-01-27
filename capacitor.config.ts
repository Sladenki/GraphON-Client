import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mycompany.myapp',
  appName: 'MyApp',
  webDir: 'out', 
  server: {
    androidScheme: 'https', // Обязательно для Android 10+
    cleartext: true,
  },
  ios: {
    scheme: 'com.mycompany.myapp' // Ваша схема для iOS
  },
}

export default config;
