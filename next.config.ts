const nextConfig = {
  output: 'export', // Указываем использование статической генерации
  swcMinify: true,
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
};

module.exports = nextConfig;
