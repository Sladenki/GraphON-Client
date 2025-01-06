import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.myapp', // Уникальный идентификатор вашего приложения
  appName: 'MyApp',
  webDir: 'out', // или 'build', в зависимости от вашей сборки Next.js
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https', // или 'http', если вы используете http
    iosScheme: 'myapp', // Схема URI для iOS
    url: process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000', // Адрес вашего dev-сервера. Замените на свой IP!
    cleartext: true, // Разрешить http на Android (только для разработки!)
  },
};

export default config;
