const nextConfig = {
  swcMinify: true,

  trailingSlash: true,

  // Разрешаем загрузку изображений с любого домена 
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  reactStrictMode: true, // Включает строгий режим React
  experimental: {
    reactRefresh: true, // Включает поддержку react-refresh для быстрого обновления
  },
  
  webpack(config: any) {
    // Используем файловое кеширование для ускорения сборки
    config.cache = {
      type: 'filesystem', 
    };

    return config;
  },
  
};

module.exports = nextConfig;
