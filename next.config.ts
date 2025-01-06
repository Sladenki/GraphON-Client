const nextConfig = {
  output: 'export', // Указываем использование статической генерации
  swcMinify: true,
  experimental: {
    images: {
      unoptimized: true,
    },
  },
  // Разрешаем загрузку изображений с любого домена 
  images: {
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
};

module.exports = nextConfig;
