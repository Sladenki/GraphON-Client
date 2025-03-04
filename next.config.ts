const nextConfig = {
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
    turbo: {
      enabled: true, // Включаем Turbopack
    },
  },
  
};

export default nextConfig;
