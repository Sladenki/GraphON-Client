import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mycompany.myapp',
  appName: 'MyApp',
  webDir: 'out', 
  server: {
    url: 'http://31.192.132.196:3000',
    androidScheme: 'https', // Обязательно для Android 10+
    cleartext: true,
  },
  ios: {
    scheme: 'com.mycompany.myapp' // Ваша схема для iOS
  },
  plugins: {
    GoogleAuth: {
        scopes: ['profile', 'email'],
        serverClientId: '742159922482-27llfsd7mg5tse43jpegd48q7d4ekab6.apps.googleusercontent.com', // Замените на ваш Server Client ID из Google Console
        forceCodeForRefreshToken: true,
    },
},
}

export default config;
