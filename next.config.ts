const nextConfig = {
  trailingSlash: true,

  // Разрешаем загрузку изображений с любого домена 
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
    turbo: {
      enabled: true, // Включаем Turbopack
    },
  },
  
};

export default nextConfig;
