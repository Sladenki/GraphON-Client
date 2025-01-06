import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mycompany.myapp',
  appName: 'MyApp',
  webDir: 'out', 
  server: {
    url: 'http://31.192.132.196',
    androidScheme: 'https', // Обязательно для Android 10+
    cleartext: true,
  },
  ios: {
    scheme: 'com.mycompany.myapp' // Ваша схема для iOS
  },
  plugins: {
    App: {
        handleUrlOpen: true, // Включить обработку URL
    },
},
}

export default config;
